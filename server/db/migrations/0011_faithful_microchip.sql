CREATE INDEX "game_players_player_id_idx" ON "game_players" USING btree ("player_id");--> statement-breakpoint
CREATE INDEX "game_players_character_id_idx" ON "game_players" USING btree ("character_id");--> statement-breakpoint
ALTER TABLE "game_players" ADD CONSTRAINT "game_character_unique" UNIQUE("game_id","character_id");--> statement-breakpoint
ALTER TABLE "game_players" ADD CONSTRAINT "team_number_positive" CHECK ("game_players"."team_number" >= 1);