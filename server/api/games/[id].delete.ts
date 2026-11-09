import { eq } from "drizzle-orm";

import { db } from "../../db";
import { gamePlayers } from "../../db/schema/game-players";
import { games } from "../../db/schema/games";
import { ratingHistory } from "../../db/schema/rating-history";
import { requireAdmin } from "../../utils/auth";
import { recalculateRatingsFrom } from "../../utils/recalculate-ratings";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const gameId = Number(event.context.params?.id);

  if (!Number.isInteger(gameId) || gameId <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Некоректний ID гри",
    });
  }

  await db.transaction(async (tx) => {
    const formerPlayers = await tx
      .select({ playerId: gamePlayers.playerId })
      .from(gamePlayers)
      .where(eq(gamePlayers.gameId, gameId));

    await tx.delete(ratingHistory).where(eq(ratingHistory.gameId, gameId));
    await tx.delete(gamePlayers).where(eq(gamePlayers.gameId, gameId));

    const [deleted] = await tx
      .delete(games)
      .where(eq(games.id, gameId))
      .returning({ id: games.id });

    if (!deleted) {
      throw createError({
        statusCode: 404,
        statusMessage: "Гру не знайдено",
      });
    }

    await recalculateRatingsFrom(
      tx,
      gameId,
      formerPlayers.map((player) => player.playerId),
    );
  });

  return { id: gameId };
});
