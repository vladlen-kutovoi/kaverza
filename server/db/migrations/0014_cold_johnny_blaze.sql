CREATE TYPE "public"."player_role" AS ENUM('user', 'admin');--> statement-breakpoint
ALTER TABLE "games" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "games" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "players" ALTER COLUMN "role" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "players" ALTER COLUMN "role" SET DATA TYPE "public"."player_role" USING "role"::"public"."player_role";--> statement-breakpoint
ALTER TABLE "players" ALTER COLUMN "role" SET DEFAULT 'user'::"public"."player_role";--> statement-breakpoint
ALTER TABLE "sessions" ALTER COLUMN "expires_at" SET DATA TYPE timestamp with time zone;
