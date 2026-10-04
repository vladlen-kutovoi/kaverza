CREATE TABLE "characters" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "characters_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"color" text NOT NULL,
	CONSTRAINT "characters_name_unique" UNIQUE("name"),
	CONSTRAINT "characters_slug_unique" UNIQUE("slug")
);
