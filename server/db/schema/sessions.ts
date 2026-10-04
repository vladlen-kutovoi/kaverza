import {
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core"

import { players } from "./players"

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  playerId: integer("player_id")
    .notNull()
    .references(() => players.id),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
})