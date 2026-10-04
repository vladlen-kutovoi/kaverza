import { ne } from 'drizzle-orm'

import { db } from '../../db'
import { players } from '../../db/schema/players'

export default defineEventHandler(async (event) => {
  // Hidden players are kept off the public roster, but they still have to be
  // pickable when recording a game, so that caller asks for them explicitly
  const { includeHidden } = getQuery(event)

  const columns = {
    id: players.id,
    name: players.name,
    slug: players.slug,
    rating: players.rating,
    role: players.role,
    avatar: players.avatar,
  }

  if (includeHidden === 'true') {
    return await db.select(columns).from(players)
  }

  return await db
    .select(columns)
    .from(players)
    .where(ne(players.role, 'hidden'))
})
