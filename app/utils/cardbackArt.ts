// The art is bundled, not fetched by guessed URL: a character whose card
// has not been scanned yet simply has no entry here and falls back to its
// initial, with no broken request on the way. Files are named after the
// slug, so there is no column in the db to keep in sync.
export const cardbackArt: Record<string, string> = Object.fromEntries(
  Object.entries(
    import.meta.glob<string>("../assets/images/cardbacks/*.webp", {
      eager: true,
      query: "?url",
      import: "default",
    }),
  ).map(([path, url]) => [path.split("/").pop()!.replace(".webp", ""), url]),
);
