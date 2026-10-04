import {
  check,
  index,
  integer,
  pgTable,
  primaryKey,
  unique,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { characters } from "./characters";
import { games } from "./games";
import { players } from "./players";

export const gamePlayers = pgTable(
  "game_players",
  {
    gameId: integer("game_id")
      .notNull()
      .references(() => games.id),
    playerId: integer("player_id")
      .notNull()
      .references(() => players.id),
    characterId: integer("character_id")
      .notNull()
      .references(() => characters.id),
    teamNumber: integer("team_number").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.gameId, table.playerId] }),
    unique("game_character_unique").on(table.gameId, table.characterId),
    check("team_number_positive", sql`${table.teamNumber} >= 1`),
    index("game_players_player_id_idx").on(table.playerId),
    index("game_players_character_id_idx").on(table.characterId),
  ],
);
