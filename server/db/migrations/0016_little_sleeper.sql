CREATE TABLE "rating_history" (
	"game_id" integer NOT NULL,
	"player_id" integer NOT NULL,
	"rating_before" integer NOT NULL,
	"rating_after" integer NOT NULL,
	CONSTRAINT "rating_history_game_id_player_id_pk" PRIMARY KEY("game_id","player_id")
);
--> statement-breakpoint
ALTER TABLE "rating_history" ADD CONSTRAINT "rating_history_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rating_history" ADD CONSTRAINT "rating_history_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
INSERT INTO "rating_history" ("game_id", "player_id", "rating_before", "rating_after") SELECT "game_id", "player_id", "rating_before", "rating_after" FROM "game_players";--> statement-breakpoint
ALTER TABLE "game_players" DROP COLUMN "rating_before";--> statement-breakpoint
ALTER TABLE "game_players" DROP COLUMN "rating_after";