import { asc, desc, eq, inArray } from "drizzle-orm";

import { db } from "../../db";
import { characters } from "../../db/schema/characters";
import { gamePlayers } from "../../db/schema/game-players";
import { games } from "../../db/schema/games";
import { players } from "../../db/schema/players";
import type { MatchupRecord } from "../../utils/matchups";
import { loadMatchups, matchupWinRate } from "../../utils/matchups";

export default defineEventHandler(async (event) => {
  const slug = event.context.params?.slug;

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: "Некоректний slug персонажа",
    });
  }

  const [character] = await db
    .select({
      id: characters.id,
      name: characters.name,
      slug: characters.slug,
      color: characters.color,
    })
    .from(characters)
    .where(eq(characters.slug, slug))
    .limit(1);

  if (!character) {
    throw createError({
      statusCode: 404,
      statusMessage: "Персонажа не знайдено",
    });
  }

  const characterGames = await db
    .select({
      gameId: games.id,
      type: games.type,
      createdAt: games.createdAt,
      winningTeamNumber: games.winningTeamNumber,
      playerId: gamePlayers.playerId,
      teamNumber: gamePlayers.teamNumber,
      characterId: gamePlayers.characterId,
    })
    .from(gamePlayers)
    .innerJoin(games, eq(games.id, gamePlayers.gameId))
    .where(eq(gamePlayers.characterId, character.id))
    .orderBy(asc(games.createdAt), asc(games.id));

  const gameIds = characterGames.map((game) => game.gameId);

  const gameRows =
    gameIds.length > 0
      ? await db
          .select({
            gameId: games.id,
            type: games.type,
            createdAt: games.createdAt,
            winningTeamNumber: games.winningTeamNumber,

            playerId: players.id,
            playerName: players.name,
            playerSlug: players.slug,
            teamNumber: gamePlayers.teamNumber,

            characterId: characters.id,
            characterName: characters.name,
            characterSlug: characters.slug,
            characterColor: characters.color,
          })
          .from(games)
          .innerJoin(
            gamePlayers,
            eq(gamePlayers.gameId, games.id),
          )
          .innerJoin(
            players,
            eq(players.id, gamePlayers.playerId),
          )
          .innerJoin(
            characters,
            eq(characters.id, gamePlayers.characterId),
          )
          .where(inArray(games.id, gameIds))
          .orderBy(
            desc(games.createdAt),
            desc(games.id),
            asc(gamePlayers.teamNumber),
            asc(players.id),
          )
      : [];

  const totalGames = characterGames.length;

  const totalWins = characterGames.filter(
    (game) => game.teamNumber === game.winningTeamNumber,
  ).length;

  const totalLosses = totalGames - totalWins;

  const winRate =
    totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;

  const gameTypeStats = {
    duel: {
      games: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
    },
    team: {
      games: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
    },
    ffa: {
      games: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
    },
  };

  let cumulativeGames = 0;
  let cumulativeWins = 0;

  const winRateHistory = characterGames.map((game) => {
    cumulativeGames++;

    if (game.teamNumber === game.winningTeamNumber) {
      cumulativeWins++;
    }

    return {
      gameId: game.gameId,
      date: game.createdAt,
      games: cumulativeGames,
      wins: cumulativeWins,
      winRate: Math.round((cumulativeWins / cumulativeGames) * 100),
    };
  });

  for (const game of characterGames) {
    const stats = gameTypeStats[game.type];

    stats.games++;

    if (game.teamNumber === game.winningTeamNumber) {
      stats.wins++;
    } else {
      stats.losses++;
    }
  }

  for (const stats of Object.values(gameTypeStats)) {
    stats.winRate =
      stats.games > 0 ? Math.round((stats.wins / stats.games) * 100) : 0;
  }

  // Only the opponents actually met, most-played first: an opponent
  // never faced would be an empty row, and there are more of those the
  // longer the roster gets
  const opponentRecords =
    (await loadMatchups()).get(character.id) ??
    new Map<number, MatchupRecord>();

  const opponentIds = Array.from(opponentRecords.keys());

  const opponentRows =
    opponentIds.length > 0
      ? await db
          .select({
            id: characters.id,
            name: characters.name,
            slug: characters.slug,
            color: characters.color,
          })
          .from(characters)
          .where(inArray(characters.id, opponentIds))
      : [];

  const matchups = opponentRows
    .map((opponent) => {
      const record = opponentRecords.get(opponent.id)!;

      return {
        ...opponent,
        games: record.games,
        wins: record.wins,
        losses: record.games - record.wins,
        winRate: matchupWinRate(record),
      };
    })
    .sort((a, b) => b.games - a.games || a.name.localeCompare(b.name));

  type GameResponse = {
    id: number;
    type: (typeof gameRows)[number]["type"];
    createdAt: Date;
    win: boolean;
    teams: Map<
      number,
      {
        teamNumber: number;
        winner: boolean;
        players: {
          id: number;
          name: string;
          slug: string;
          character: {
            id: number;
            name: string;
            slug: string;
            color: string;
          };
        }[];
      }
    >;
  };

  const groupedGames = new Map<number, GameResponse>();

  for (const row of gameRows) {
    let game = groupedGames.get(row.gameId);

    if (!game) {
      const characterGame = characterGames.find(
        (characterGame) => characterGame.gameId === row.gameId,
      );

      if (!characterGame) {
        continue;
      }

      game = {
        id: row.gameId,
        type: row.type,
        createdAt: row.createdAt,
        win:
          characterGame.teamNumber ===
          characterGame.winningTeamNumber,
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
      character: {
        id: row.characterId,
        name: row.characterName,
        slug: row.characterSlug,
        color: row.characterColor,
      },
    });
  }

  const gamesResponse = Array.from(groupedGames.values()).map(
    (game) => ({
      id: game.id,
      type: game.type,
      createdAt: game.createdAt,
      win: game.win,
      teams: Array.from(game.teams.values()).sort(
        (a, b) => a.teamNumber - b.teamNumber,
      ),
    }),
  );

  return {
    id: character.id,
    name: character.name,
    slug: character.slug,
    color: character.color,

    stats: {
      games: totalGames,
      wins: totalWins,
      losses: totalLosses,
      winRate,
    },

    byGameType: gameTypeStats,

    matchups,

    winRateHistory,

    games: gamesResponse,
  };
});