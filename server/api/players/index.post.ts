import { z } from "zod";
import argon2 from "argon2";
import { eq } from "drizzle-orm";

import { AVATARS, randomAvatar } from "#shared/utils/avatars";
import { db } from "../../db";
import { players } from "../../db/schema/players";
import { createSession } from "../../utils/auth";

const createPlayerSchema = z
  .object({
    name: z.string().trim().min(1).max(50),
    // The client always sends one, but an older client or a direct call
    // should not fail over a picture - it falls back to a random key.
    avatar: z.enum(AVATARS as [string, ...string[]]).optional(),
    password: z.string().min(8).max(128),
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    path: ["passwordConfirmation"],
    message: "Паролі не збігаються",
  });

export default defineEventHandler(async (event) => {
  const validatedData = await validateBody(event, createPlayerSchema);

  const existingPlayer = await db
    .select({ id: players.id })
    .from(players)
    .where(eq(players.name, validatedData.name))
    .limit(1);

  if (existingPlayer.length > 0) {
    const message = "Гравець з таким ім'ям уже існує";

    throw createError({
      statusCode: 409,
      statusMessage: message,
      data: {
        issues: [{ path: ["name"], message }],
      },
    });
  }

  const passwordHash = await argon2.hash(validatedData.password);
  const slug = await generateUniquePlayerSlug(validatedData.name);

  const [player] = await db
    .insert(players)
    .values({
      name: validatedData.name,
      avatar: validatedData.avatar ?? randomAvatar(),
      passwordHash,
      slug,
    })
    .returning({
      id: players.id,
      name: players.name,
      slug: players.slug,
      rating: players.rating,
      avatar: players.avatar,
    });

  if (!player) {
    throw createError({
      statusCode: 500,
      statusMessage: "Не вдалося створити гравця",
    });
  }

  // Реєстрація одразу входить в акаунт - окремий вхід після неї не потрібен
  await createSession(event, player.id);

  return player;
});
