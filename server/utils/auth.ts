import type { H3Event } from "h3"

import { randomBytes } from "node:crypto"
import { eq, lte } from "drizzle-orm"
import { db } from "../db"
import { players } from "../db/schema/players"
import { sessions } from "../db/schema/sessions"

// Пів року: облік ігор ведуть рідко, тож повторний вхід щомісяця тільки
// мішає. Сесія продовжується на кожному запиті (див. getCurrentUser),
// тому активний гравець не виходить із акаунта ніколи
export const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 180

// Нижче цього порогу сесія подовжується. Не на кожному запиті - щоб не
// писати в базу частіше, ніж потрібно
const SESSION_RENEW_AFTER_MS = SESSION_DURATION_MS / 2

function setSessionCookie(event: H3Event, sessionId: string, expiresAt: Date) {
  setCookie(event, "session", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  })
}

export async function createSession(event: H3Event, playerId: number) {
  await db.delete(sessions).where(lte(sessions.expiresAt, new Date()))

  const sessionId = randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS)

  await db.insert(sessions).values({
    id: sessionId,
    playerId,
    expiresAt,
  })

  setSessionCookie(event, sessionId, expiresAt)

  return { sessionId, expiresAt }
}

export async function getCurrentUser(event: H3Event) {
  const sessionId = getCookie(event, "session")

  if (!sessionId) {
    return null
  }

  const result = await db
    .select({
      session: sessions,
      player: {
        id: players.id,
        name: players.name,
        slug: players.slug,
        rating: players.rating,
        role: players.role,
        avatar: players.avatar,
      },
    })
    .from(sessions)
    .innerJoin(players, eq(sessions.playerId, players.id))
    .where(eq(sessions.id, sessionId))
    .limit(1)

  const data = result[0]

  if (!data) {
    return null
  }

  if (data.session.expiresAt <= new Date()) {
    await db.delete(sessions).where(eq(sessions.id, sessionId))

    return null
  }

  if (data.session.expiresAt.getTime() - Date.now() < SESSION_RENEW_AFTER_MS) {
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS)

    await db
      .update(sessions)
      .set({ expiresAt })
      .where(eq(sessions.id, sessionId))

    setSessionCookie(event, sessionId, expiresAt)
  }

  return data.player
}

export async function requireUser(event: H3Event) {
  const user = await getCurrentUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Не авторизований",
    })
  }

  return user
}

export async function requireAdmin(event: H3Event) {
  const user = await requireUser(event)

  if (user.role !== "admin") {
    throw createError({
      statusCode: 403,
      statusMessage: "Недостатньо прав",
    })
  }

  return user
}
