import { z } from "zod";
import { eq } from "drizzle-orm";

import { db } from "../../db";
import { characters } from "../../db/schema/characters";
import { requireAdmin } from "../../utils/auth";
import { generateUniqueCharacterSlug } from "../../utils/slug";
import { validateBody } from "../../utils/validate-body";

const createCharacterSchema = z
  .object({
    name: z.string().trim().min(1).max(50),
    color: z.string().min(1).max(32),
  })

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const validatedData = await validateBody(event, createCharacterSchema);

  const existingCharacter = await db
    .select({ id: characters.id })
    .from(characters)
    .where(eq(characters.name, validatedData.name))
    .limit(1);

  if (existingCharacter.length > 0) {
    const message = "Персонаж з таким ім'ям уже існує";

    throw createError({
      statusCode: 409,
      statusMessage: message,
      data: {
        issues: [{ path: ["name"], message }],
      },
    });
  }

  const slug = await generateUniqueCharacterSlug(validatedData.name);

  const [character] = await db
    .insert(characters)
    .values({
      name: validatedData.name,
      color: validatedData.color,
      slug,
    })
    .returning({
      id: characters.id,
      name: characters.name,
      slug: characters.slug,
      color: characters.color,
    });

  return character;
});
