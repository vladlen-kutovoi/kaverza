export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("uk-UA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
