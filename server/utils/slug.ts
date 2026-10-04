import { eq } from "drizzle-orm";

import { db } from "../db";
import { characters } from "../db/schema/characters";
import { players } from "../db/schema/players";

const transliterationMap: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "h",
  ґ: "g",
  д: "d",
  е: "e",
  є: "ie",
  ж: "zh",
  з: "z",
  и: "y",
  і: "i",
  ї: "i",
  й: "i",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "kh",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "shch",
  ь: "",
  ю: "iu",
  я: "ia",
};

export function generateSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .split("")
    .map((character) => transliterationMap[character] ?? character)
    .join("")
    .normalize("NFKD") // спец літери у звичайні
    .replace(/[\u0300-\u036f]/g, "") // прибираємо діакритичні знаки
    .replace(/[^a-z0-9]+/g, "-") // замінюємо всі не-алфавітні символи на дефіс
    .replace(/^-+|-+$/g, ""); // прибираємо дефіси з початку і кінця
}

async function generateUniqueSlug(
  name: string,
  isSlugTaken: (slug: string) => Promise<boolean>,
): Promise<string> {
  const baseSlug = generateSlug(name) || "item";

  let slug = baseSlug;
  let suffix = 2;

  while (await isSlugTaken(slug)) {
    slug = `${baseSlug}-${suffix}`;
    suffix++;
  }

  return slug;
}

export function generateUniquePlayerSlug(name: string): Promise<string> {
  return generateUniqueSlug(name, async (slug) => {
    const existing = await db
      .select({ id: players.id })
      .from(players)
      .where(eq(players.slug, slug))
      .limit(1);

    return existing.length > 0;
  });
}

export function generateUniqueCharacterSlug(name: string): Promise<string> {
  return generateUniqueSlug(name, async (slug) => {
    const existing = await db
      .select({ id: characters.id })
      .from(characters)
      .where(eq(characters.slug, slug))
      .limit(1);

    return existing.length > 0;
  });
}
