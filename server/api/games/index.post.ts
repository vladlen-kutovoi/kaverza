
import { eq, inArray } from "drizzle-orm";

import { db } from "../../db";
import { players } from "../../db/schema/players";
import { requireUser } from "../../utils/auth";
import { characters } from "../../db/schema/characters";
import { gamePlayers } from "../../db/schema/game-players";
import { games } from "../../db/schema/games";
import { ratingHistory } from "../../db/schema/rating-history";
import { calculateGameRatingChanges } from "../../utils/elo";
import { createGameSchema } from "../../utils/validation/game";
import { validateBody } from "../../utils/validate-body";

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);

  const data = await validateBody(event, createGameSchema);

  const characterIds = data.players.map((player) => player.characterId);

  const existingCharacters = await db
    .select({
      id: characters.id,
    })
    .from(characters)
    .where(inArray(characters.id, characterIds));

  if (existingCharacters.length !== characterIds.length) {
    throw createError({
      statusCode: 400,
      statusMessage: "Один або кілька персонажів не існують",
    });
  }

  const playerIds = data.players.map((player) => player.playerId);

  const result = await db.transaction(async (tx) => {
    // Блокуємо рядки гравців до кінця транзакції, щоб паралельні ігри
    // не перезаписали рейтинги одна одної
    const existingPlayers = await tx
      .select({
        id: players.id,
        rating: players.rating,
      })
      .from(players)
      .where(inArray(players.id, playerIds))
      .for("update");

    if (existingPlayers.length !== data.players.length) {
      throw createError({
        statusCode: 400,
        statusMessage: "Один або кілька гравців не існують",
      });
    }

    const playerById = new Map(
      existingPlayers.map((player) => [player.id, player]),
    );

    const participants = data.players.map((player) => {
      const existingPlayer = playerById.get(player.playerId);

      if (!existingPlayer) {
        throw createError({
          statusCode: 400,
          statusMessage: "Не вдалося отримати рейтинги гравців",
        });
      }

      return {
        ...player,
        rating: existingPlayer.rating,
      };
    });

    const ratingChanges = calculateGameRatingChanges(
      data.type,
      participants,
      data.winningTeamNumber,
    );

    const [game] = await tx
      .insert(games)
      .values({
        type: data.type,
        winningTeamNumber: data.winningTeamNumber,
        createdBy: user.id,
      })
      .returning({
        id: games.id,
        createdAt: games.createdAt,
      });

    if (!game) {
      throw createError({
        statusCode: 500,
        statusMessage: "Не вдалося створити гру",
      });
    }

    await tx.insert(gamePlayers).values(
      participants.map((player) => ({
        gameId: game.id,
        playerId: player.playerId,
        characterId: player.characterId,
        teamNumber: player.teamNumber,
      })),
    );

    await tx.insert(ratingHistory).values(
      ratingChanges.map((player) => ({
        gameId: game.id,
        playerId: player.playerId,
        ratingBefore: player.ratingBefore,
        ratingAfter: player.ratingAfter,
      })),
    );

    for (const player of ratingChanges) {
      await tx
        .update(players)
        .set({
          rating: player.ratingAfter,
        })
        .where(eq(players.id, player.playerId));
    }

    return {
      game,
      players: ratingChanges,
    };
  });

  return result;
});
