/* The wall of Feint art behind the hero, dealt here rather than inside
   the component so it is dealt once per load instead of once per render.

   The art is bundled by glob, not fetched: the wall is decoration, so
   whatever sits in app/assets/images/feints is what it shows - no db
   column, no broken requests. */
const ART = Object.values(
  import.meta.glob<string>("../assets/images/feints/*.{png,webp}", {
    eager: true,
    query: "?url",
    import: "default",
  }),
);

/* Four rows is what fills the hero once each is stretched to an equal
   share of it; eighteen cards is enough that one copy of a row outruns
   the widest viewport, so the drift never scrolls a gap into view. */
const ROWS = 4;
const PER_ROW = 18;

/* Seeded, because the server and the browser each deal the wall for
   themselves and have to arrive at the same one - Math.random() would
   hand Vue two different walls to hydrate. The constants are the
   minimal standard generator's, whose products stay inside the integers
   a double counts exactly, which is what makes two machines agree on
   the stream. */
function dealer(seed: number) {
  return () => (seed = (seed * 48271) % 2147483647) / 2147483647;
}

/* Fisher-Yates over a copy, so a row is a real deal of the folder
   rather than the folder in order: no card twice in a row, and no two
   rows running the same sequence. */
function shuffle(items: string[], next: () => number) {
  const out = [...items];

  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }

  return out;
}

const next = dealer(20261004);

const FEINT_ROWS = Array.from({ length: ROWS }, () =>
  shuffle(ART, next).slice(0, PER_ROW),
);

export { FEINT_ROWS };
