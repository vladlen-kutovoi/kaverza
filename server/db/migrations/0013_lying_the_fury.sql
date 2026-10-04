ALTER TABLE "players" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_slug_unique" UNIQUE("slug");