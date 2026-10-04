import { and, asc, eq } from "drizzle-orm";

import { db } from "../../db";
import { characters } from "../../db/schema/characters";
import { gamePlayers } from "../../db/schema/game-players";
import { games } from "../../db/schema/games";
import { players } from "../../db/schema/players";
import { ratingHistory } from "../../db/schema/rating-history";

export default defineEventHandler(async (event) => {
  const gameId = Number(event.context.params?.id);

  if (!Number.isInteger(gameId) || gameId <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Некоректний ID гри",
    });
  }

  const rows = await db
    .select({
      gameId: games.id,
      type: games.type,
      createdAt: games.createdAt,
      winningTeamNumber: games.winningTeamNumber,

      playerId: players.id,
      playerName: players.name,
      playerSlug: players.slug,
      playerAvatar: players.avatar,
      teamNumber: gamePlayers.teamNumber,

      characterId: characters.id,
      characterName: characters.name,
      characterSlug: characters.slug,
      characterColor: characters.color,

      ratingBefore: ratingHistory.ratingBefore,
      ratingAfter: ratingHistory.ratingAfter,
    })
    .from(games)
    .innerJoin(gamePlayers, eq(gamePlayers.gameId, games.id))
    .innerJoin(players, eq(players.id, gamePlayers.playerId))
    .innerJoin(
      characters,
      eq(characters.id, gamePlayers.characterId),
    )
    .innerJoin(
      ratingHistory,
      and(
        eq(ratingHistory.gameId, games.id),
        eq(ratingHistory.playerId, players.id),
      ),
    )
    .where(eq(games.id, gameId))
    .orderBy(asc(gamePlayers.teamNumber), asc(players.id));

  const firstRow = rows[0];

  if (!firstRow) {
    throw createError({
      statusCode: 404,
      statusMessage: "Гру не знайдено",
    });
  }

  const teams = new Map<
    number,
    {
      teamNumber: number;
      winner: boolean;
      players: {
        id: number;
        name: string;
        slug: string;
        avatar: string | null;
        character: {
          id: number;
          name: string;
          slug: string;
          color: string;
        };
        ratingBefore: number;
        ratingAfter: number;
        ratingChange: number;
      }[];
    }
  >();

  for (const row of rows) {
    let team = teams.get(row.teamNumber);

    if (!team) {
      team = {
        teamNumber: row.teamNumber,
        winner: row.teamNumber === row.winningTeamNumber,
        players: [],
      };

      teams.set(row.teamNumber, team);
    }

    team.players.push({
      id: row.playerId,
      name: row.playerName,
      slug: row.playerSlug,
      avatar: row.playerAvatar,
      character: {
        id: row.characterId,
        name: row.characterName,
        slug: row.characterSlug,
        color: row.characterColor,
      },
      ratingBefore: row.ratingBefore,
      ratingAfter: row.ratingAfter,
      ratingChange: row.ratingAfter - row.ratingBefore,
    });
  }

  return {
    id: firstRow.gameId,
    type: firstRow.type,
    createdAt: firstRow.createdAt,
    teams: Array.from(teams.values()).sort(
      (a, b) => a.teamNumber - b.teamNumber,
    ),
  };
});