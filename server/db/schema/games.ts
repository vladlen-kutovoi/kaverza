import { integer, pgEnum, pgTable, timestamp } from "drizzle-orm/pg-core";
import { players } from "./players";

export const gameTypeEnum = pgEnum("game_type", ["duel", "team", "ffa"]);

export const games = pgTable("games", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  type: gameTypeEnum("type").notNull(),
  winningTeamNumber: integer("winning_team_number").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  createdBy: integer("created_by")
    .notNull()
    .references(() => players.id),
});
