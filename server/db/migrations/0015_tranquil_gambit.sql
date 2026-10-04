ALTER TABLE "game_players" ADD COLUMN "rating_before" integer;--> statement-breakpoint
ALTER TABLE "game_players" ADD COLUMN "rating_after" integer;--> statement-breakpoint
UPDATE "game_players" SET "rating_before" = "rating_history"."rating_before", "rating_after" = "rating_history"."rating_after" FROM "rating_history" WHERE "rating_history"."game_id" = "game_players"."game_id" AND "rating_history"."player_id" = "game_players"."player_id";--> statement-breakpoint
ALTER TABLE "game_players" ALTER COLUMN "rating_before" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "game_players" ALTER COLUMN "rating_after" SET NOT NULL;--> statement-breakpoint
DROP TABLE "rating_history" CASCADE;
