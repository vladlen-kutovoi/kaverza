import { and, desc, eq } from "drizzle-orm";

import { db } from "../../db";
import { characters } from "../../db/schema/characters";
import { gamePlayers } from "../../db/schema/game-players";
import { games } from "../../db/schema/games";
import { players } from "../../db/schema/players";
import { ratingHistory } from "../../db/schema/rating-history";

export default defineEventHandler(async (event) => {
  const slug = event.context.params?.slug;

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: "Некоректний slug гравця",
    });
  }

  const [player] = await db
    .select({
      id: players.id,
      name: players.name,
      slug: players.slug,
      rating: players.rating,
      avatar: players.avatar,
    })
    .from(players)
    .where(eq(players.slug, slug))
    .limit(1);

  if (!player) {
    throw createError({
      statusCode: 404,
      statusMessage: "Гравця не знайдено",
    });
  }

  const playerGameRows = await db
    .select({
      gameId: games.id,
      type: games.type,
      createdAt: games.createdAt,
      winningTeamNumber: games.winningTeamNumber,
      teamNumber: gamePlayers.teamNumber,

      characterId: characters.id,
      characterName: characters.name,
      characterSlug: characters.slug,
      characterColor: characters.color,

      ratingBefore: ratingHistory.ratingBefore,
      ratingAfter: ratingHistory.ratingAfter,
    })
    .from(gamePlayers)
    .innerJoin(games, eq(games.id, gamePlayers.gameId))
    .innerJoin(
      characters,
      eq(characters.id, gamePlayers.characterId),
    )
    .innerJoin(
      ratingHistory,
      and(
        eq(ratingHistory.gameId, games.id),
        eq(ratingHistory.playerId, player.id),
      ),
    )
    .where(eq(gamePlayers.playerId, player.id))
    .orderBy(desc(games.createdAt), desc(games.id));

  const totalGames = playerGameRows.length;

  const totalWins = playerGameRows.filter(
    (game) => game.teamNumber === game.winningTeamNumber,
  ).length;

  const totalLosses = totalGames - totalWins;

  const winRate =
    totalGames > 0
      ? Math.round((totalWins / totalGames) * 100)
      : 0;

  const characterStatsMap = new Map<
    number,
    {
      id: number;
      name: string;
      slug: string;
      color: string;
      games: number;
      wins: number;
    }
  >();

  for (const game of playerGameRows) {
    let character = characterStatsMap.get(game.characterId);

    if (!character) {
      character = {
        id: game.characterId,
        name: game.characterName,
        slug: game.characterSlug,
        color: game.characterColor,
        games: 0,
        wins: 0,
      };

      characterStatsMap.set(game.characterId, character);
    }

    character.games++;

    if (game.teamNumber === game.winningTeamNumber) {
      character.wins++;
    }
  }

  const characterStats = Array.from(
    characterStatsMap.values(),
  )
    .map((character) => ({
      ...character,
      losses: character.games - character.wins,
      winRate:
        character.games > 0
          ? Math.round((character.wins / character.games) * 100)
          : 0,
    }))
    .sort(
      (a, b) =>
        b.games - a.games ||
        a.name.localeCompare(b.name),
    );

  const favoriteCharacter = characterStats[0] ?? null;

  const ratingHistoryResponse = [...playerGameRows]
    .sort((a, b) => {
      const dateDifference =
        a.createdAt.getTime() - b.createdAt.getTime();

      if (dateDifference !== 0) {
        return dateDifference;
      }

      return a.gameId - b.gameId;
    })
    .map((game) => ({
      gameId: game.gameId,
      date: game.createdAt,
      ratingBefore: game.ratingBefore,
      ratingAfter: game.ratingAfter,
      ratingChange:
        game.ratingAfter - game.ratingBefore,
    }));

  const gamesResponse = playerGameRows.map((game) => ({
    id: game.gameId,
    type: game.type,
    createdAt: game.createdAt,
    character: {
      id: game.characterId,
      name: game.characterName,
      slug: game.characterSlug,
      color: game.characterColor,
    },
    ratingChange:
      game.ratingAfter - game.ratingBefore,
  }));

  return {
    id: player.id,
    name: player.name,
    slug: player.slug,
    rating: player.rating,
    avatar: player.avatar,

    stats: {
      games: totalGames,
      wins: totalWins,
      losses: totalLosses,
      winRate,
    },

    favoriteCharacter,

    characters: characterStats,

    ratingHistory: ratingHistoryResponse,

    games: gamesResponse,
  };
});