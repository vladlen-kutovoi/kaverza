import { db } from '../../db'
import { characters } from '../../db/schema/characters'

export default defineEventHandler(async () => {
  return await db.select({
    id: characters.id,
    name: characters.name,
    slug: characters.slug,
    color: characters.color,
  })
  .from(characters)
})