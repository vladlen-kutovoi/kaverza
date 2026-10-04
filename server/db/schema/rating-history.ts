import {
  integer,
  pgTable,
  primaryKey,
} from "drizzle-orm/pg-core"

import { games } from "./games"
import { players } from "./players"

export const ratingHistory = pgTable(
  "rating_history",
  {
    gameId: integer("game_id")
      .notNull()
      .references(() => games.id),

    playerId: integer("player_id")
      .notNull()
      .references(() => players.id),

    ratingBefore: integer("rating_before").notNull(),

    ratingAfter: integer("rating_after").notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.gameId, table.playerId],
    }),
  ],
)
