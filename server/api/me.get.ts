import { requireUser } from "../utils/auth"

export default defineEventHandler(async (event) => {
  return await requireUser(event)
})
