import { z } from "zod";
import { eq } from "drizzle-orm";
import argon2 from "argon2";
import { db } from "../db";
import { players } from "../db/schema/players";
import { randomBytes } from "node:crypto";
import { createSession } from "../utils/auth";
import { validateBody } from "../utils/validate-body";

const loginSchema = z.object({
  name: z.string().trim().min(1).max(50),
  password: z.string().min(1).max(128),
});

// Хеш для перевірки, коли гравця не знайдено: відповідь займає стільки ж часу,
// і за таймінгом не можна визначити, чи існує ім'я
let dummyPasswordHash: Promise<string> | undefined;

export default defineEventHandler(async (event) => {
  const validatedData = await validateBody(event, loginSchema);

  const result = await db
    .select()
    .from(players)
    .where(eq(players.name, validatedData.name))
    .limit(1);

  const player = result[0];

  dummyPasswordHash ??= argon2.hash(randomBytes(32).toString("hex"));

  const isPasswordValid = await argon2.verify(
    player?.passwordHash ?? (await dummyPasswordHash),
    validatedData.password,
  );

  if (!player || !isPasswordValid) {
    throw createError({
      statusCode: 401,
      statusMessage: "Неправильне ім'я користувача або пароль",
    });
  }

  await createSession(event, player.id);
});
