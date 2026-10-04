import type { MaybeRefOrGetter } from "vue";

export const GAMES_PER_PAGE = 10;

// Client-side paging over a list that is already fully loaded
export const usePagination = <T>(
  items: MaybeRefOrGetter<T[] | null | undefined>,
  perPage: number = GAMES_PER_PAGE,
) => {
  const page = ref(1);

  const pageCount = computed(() =>
    Math.max(1, Math.ceil((toValue(items)?.length ?? 0) / perPage)),
  );

  const pageItems = computed(() =>
    (toValue(items) ?? []).slice((page.value - 1) * perPage, page.value * perPage),
  );

  // Keeps the current page in range if the list shrinks
  watch(pageCount, (count) => {
    if (page.value > count) page.value = count;
  });

  return { page, pageCount, pageItems };
};
