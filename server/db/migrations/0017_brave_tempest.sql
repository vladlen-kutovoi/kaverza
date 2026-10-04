ALTER TABLE "players" ADD COLUMN "avatar" text;--> statement-breakpoint
-- Players who registered before the picker existed get one of the
-- portraits at random, so no row renders without art. Keys match
-- shared/utils/avatars.ts; `random()` is re-evaluated per row.
UPDATE "players" SET "avatar" = (ARRAY[
  'alisa-1','alisa-2','alisa-3',
  'chorna-boroda-1','chorna-boroda-2','chorna-boroda-3',
  'chupacabra-1','chupacabra-2','chupacabra-3',
  'korol-artur-1','korol-artur-2','korol-artur-3',
  'loki-1','loki-2','loki-3',
  'medusa-1','medusa-2','medusa-3',
  'pandora-1','pandora-2','pandora-3',
  'sinbad-1','sinbad-2','sinbad-3'
])[(floor(random() * 24) + 1)::int] WHERE "avatar" IS NULL;
