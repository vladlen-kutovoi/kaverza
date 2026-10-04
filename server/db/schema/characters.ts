import { integer, pgTable, text } from "drizzle-orm/pg-core"

export const characters = pgTable("characters", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  color: text("color").notNull(),
})