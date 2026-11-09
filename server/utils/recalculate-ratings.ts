import { and, asc, desc, eq, gte, inArray, lt } from "drizzle-orm";

import { db } from "../db";
import { gamePlayers } from "../db/schema/game-players";
import { games } from "../db/schema/games";
import { players } from "../db/schema/players";
import { ratingHistory } from "../db/schema/rating-history";
import { calculateGameRatingChanges } from "./elo";

// --- Types -----------------------------------------------------------
type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

type ReplayedGame = {
  type: "duel" | "team" | "ffa";
  winningTeamNumber: number;
  players: { playerId: number; teamNumber: number }[];
};

// --- Variables -------------------------------------------------------
const START_RATING = 1500;

// --- Methods -------------------------------------------------------
/** Replays Elo for every game from `fromGameId` onwards, after one was
 *  edited or deleted. Earlier games keep their history as it is.
 *
 *  Ids grow with createdAt and the date is never edited, so id order is
 *  the order the games were played in.
 *
 *  `formerPlayerIds` - who was in the game before the change. They may
 *  have no later game, but their rating still has to roll back. */
export async function recalculateRatingsFrom(
  tx: Transaction,
  fromGameId: number,
  formerPlayerIds: number[],
) {
  const rows = await tx
    .select({
      gameId: games.id,
      type: games.type,
      winningTeamNumber: games.winningTeamNumber,
      playerId: gamePlayers.playerId,
      teamNumber: gamePlayers.teamNumber,
    })
    .from(games)
    .innerJoin(gamePlayers, eq(gamePlayers.gameId, games.id))
    .where(gte(games.id, fromGameId))
    .orderBy(asc(games.id));

  // Map keeps insertion order, so the games stay in id order
  const replayedGames = new Map<number, ReplayedGame>();

  for (const row of rows) {
    let game = replayedGames.get(row.gameId);

    if (!game) {
      game = {
        type: row.type,
        winningTeamNumber: row.winningTeamNumber,
        players: [],
      };

      replayedGames.set(row.gameId, game);
    }

    game.players.push({ playerId: row.playerId, teamNumber: row.teamNumber });
  }

  const playerIds = [
    ...new Set([...formerPlayerIds, ...rows.map((row) => row.playerId)]),
  ];

  if (playerIds.length === 0) return;

  // Same lock as when a game is added: no parallel game may write a
  // rating in the middle of the replay
  await tx
    .select({ id: players.id })
    .from(players)
    .where(inArray(players.id, playerIds))
    .for("update");

  // Everyone starts where their last earlier game left them
  const earlierRatings = await tx
    .selectDistinctOn([ratingHistory.playerId], {
      playerId: ratingHistory.playerId,
      ratingAfter: ratingHistory.ratingAfter,
    })
    .from(ratingHistory)
    .where(
      and(
        inArray(ratingHistory.playerId, playerIds),
        lt(ratingHistory.gameId, fromGameId),
      ),
    )
    .orderBy(ratingHistory.playerId, desc(ratingHistory.gameId));

  const ratings = new Map(playerIds.map((id) => [id, START_RATING]));

  for (const row of earlierRatings) {
    ratings.set(row.playerId, row.ratingAfter);
  }

  await tx.delete(ratingHistory).where(gte(ratingHistory.gameId, fromGameId));

  for (const [gameId, game] of replayedGames) {
    const ratingChanges = calculateGameRatingChanges(
      game.type,
      game.players.map((player) => ({
        ...player,
        rating: ratings.get(player.playerId)!,
      })),
      game.winningTeamNumber,
    );

    await tx.insert(ratingHistory).values(
      ratingChanges.map((player) => ({
        gameId,
        playerId: player.playerId,
        ratingBefore: player.ratingBefore,
        ratingAfter: player.ratingAfter,
      })),
    );

    for (const player of ratingChanges) {
      ratings.set(player.playerId, player.ratingAfter);
    }
  }

  for (const [playerId, rating] of ratings) {
    await tx.update(players).set({ rating }).where(eq(players.id, playerId));
  }
}
