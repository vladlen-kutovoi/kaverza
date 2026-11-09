import { eq, inArray } from "drizzle-orm";

import { db } from "../../db";
import { characters } from "../../db/schema/characters";
import { gamePlayers } from "../../db/schema/game-players";
import { games } from "../../db/schema/games";
import { players } from "../../db/schema/players";
import { requireAdmin } from "../../utils/auth";
import { recalculateRatingsFrom } from "../../utils/recalculate-ratings";
import { createGameSchema } from "../../utils/validation/game";
import { validateBody } from "../../utils/validate-body";

// Date and author stay as they were - only who played and who won change
export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const gameId = Number(event.context.params?.id);

  if (!Number.isInteger(gameId) || gameId <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Некоректний ID гри",
    });
  }

  const data = await validateBody(event, createGameSchema);

  const characterIds = data.players.map((player) => player.characterId);

  const existingCharacters = await db
    .select({ id: characters.id })
    .from(characters)
    .where(inArray(characters.id, characterIds));

  if (existingCharacters.length !== characterIds.length) {
    throw createError({
      statusCode: 400,
      statusMessage: "Один або кілька персонажів не існують",
    });
  }

  const playerIds = data.players.map((player) => player.playerId);

  const existingPlayers = await db
    .select({ id: players.id })
    .from(players)
    .where(inArray(players.id, playerIds));

  if (existingPlayers.length !== playerIds.length) {
    throw createError({
      statusCode: 400,
      statusMessage: "Один або кілька гравців не існують",
    });
  }

  await db.transaction(async (tx) => {
    const formerPlayers = await tx
      .select({ playerId: gamePlayers.playerId })
      .from(gamePlayers)
      .where(eq(gamePlayers.gameId, gameId));

    const [updated] = await tx
      .update(games)
      .set({
        type: data.type,
        winningTeamNumber: data.winningTeamNumber,
      })
      .where(eq(games.id, gameId))
      .returning({ id: games.id });

    if (!updated) {
      throw createError({
        statusCode: 404,
        statusMessage: "Гру не знайдено",
      });
    }

    // The replay below rewrites this game's rating history together with
    // the later ones, so only the line-up is replaced here
    await tx.delete(gamePlayers).where(eq(gamePlayers.gameId, gameId));

    await tx.insert(gamePlayers).values(
      data.players.map((player) => ({
        gameId,
        playerId: player.playerId,
        characterId: player.characterId,
        teamNumber: player.teamNumber,
      })),
    );

    await recalculateRatingsFrom(
      tx,
      gameId,
      formerPlayers.map((player) => player.playerId),
    );
  });

  return { id: gameId };
});
