import { db } from "../db";
import { characters } from "../db/schema/characters";
import { loadMatchups, matchupWinRate } from "../utils/matchups";

export default defineEventHandler(async () => {
  const roster = await db
    .select({
      id: characters.id,
      name: characters.name,
      slug: characters.slug,
      color: characters.color,
    })
    .from(characters);

  // Sorted here rather than in SQL, so rows and columns come out in the
  // same order the characters list uses
  roster.sort((a, b) => a.name.localeCompare(b.name));

  const table = await loadMatchups();

  // One row per character, in roster order, each with one cell per
  // character in that same order - the page lays the matrix out by
  // position and needs no lookup of its own. null is the diagonal, and
  // any pair that has never met.
  const rows = roster.map((character) => {
    const opponents = table.get(character.id);

    return {
      id: character.id,

      cells: roster.map((opponent) => {
        const record =
          opponent.id === character.id
            ? undefined
            : opponents?.get(opponent.id);

        if (!record) return null;

        return {
          games: record.games,
          wins: record.wins,
          losses: record.games - record.wins,
          winRate: matchupWinRate(record),
        };
      }),
    };
  });

  return {
    characters: roster,
    rows,
  };
});
