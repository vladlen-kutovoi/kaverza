import { integer, pgEnum, pgTable, text } from "drizzle-orm/pg-core";

export const playerRoleEnum = pgEnum("player_role", ["user", "admin", "hidden"]);

export const players = pgTable("players", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  rating: integer("rating").notNull().default(1500),
  // The profile picture key, e.g. "loki-2". Nullable only so the column
  // could be added to a live table; every row is backfilled by the same
  // migration and the api always writes one.
  avatar: text("avatar"),
  passwordHash: text('password_hash').notNull(),
  role: playerRoleEnum("role").notNull().default("user"),
});
