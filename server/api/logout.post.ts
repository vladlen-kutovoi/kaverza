import { eq } from "drizzle-orm"
import { db } from "../db"
import { sessions } from "../db/schema/sessions"

export default defineEventHandler(async (event) => {
  const sessionId = getCookie(event, "session")

  if (sessionId) {
    await db
      .delete(sessions)
      .where(eq(sessions.id, sessionId))
  }

  deleteCookie(event, "session", {
    path: "/",
  })

  return {
    success: true,
  }
})