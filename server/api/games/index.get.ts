import { asc, desc, eq } from "drizzle-orm";

import { db } from "../../db";
import { characters } from "../../db/schema/characters";
import { gamePlayers } from "../../db/schema/game-players";
import { games } from "../../db/schema/games";
import { players } from "../../db/schema/players";

export default defineEventHandler(async () => {
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
    })
    .from(games)
    .innerJoin(gamePlayers, eq(gamePlayers.gameId, games.id))
    .innerJoin(players, eq(players.id, gamePlayers.playerId))
    .innerJoin(
      characters,
      eq(characters.id, gamePlayers.characterId),
    )
    .orderBy(
      desc(games.createdAt),
      desc(games.id),
      asc(gamePlayers.teamNumber),
      asc(players.id),
    );

  const groupedGames = new Map<
    number,
    {
      id: number;
      type: (typeof rows)[number]["type"];
      createdAt: Date;
      teams: Map<
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
          }[];
        }
      >;
    }
  >();

  for (const row of rows) {
    let game = groupedGames.get(row.gameId);

    if (!game) {
      game = {
        id: row.gameId,
        type: row.type,
        createdAt: row.createdAt,
        teams: new Map(),
      };

      groupedGames.set(row.gameId, game);
    }

    let team = game.teams.get(row.teamNumber);

    if (!team) {
      team = {
        teamNumber: row.teamNumber,
        winner: row.teamNumber === row.winningTeamNumber,
        players: [],
      };

      game.teams.set(row.teamNumber, team);
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
    });
  }

  return Array.from(groupedGames.values()).map((game) => ({
    id: game.id,
    type: game.type,
    createdAt: game.createdAt,
    teams: Array.from(game.teams.values()).sort(
      (a, b) => a.teamNumber - b.teamNumber,
    ),
  }));
});