export const useAuth = () => {
  // /api/me answers 401 for a guest, which is not an error here - the
  // catch turns it into `null` so no error state reaches the UI.
  const headers = import.meta.server
    ? useRequestHeaders(["cookie"])
    : undefined;

  const { data: user, refresh } = useAsyncData(
    "current-user",
    () => $fetch("/api/me", { headers }).catch(() => null),
    { default: () => null },
  );

  const isAdmin = computed(() => user.value?.role === "admin");

  const logout = async () => {
    await $fetch("/api/logout", { method: "POST" });
    user.value = null;
    await navigateTo("/");
  };

  return { user, isAdmin, refresh, logout };
};
