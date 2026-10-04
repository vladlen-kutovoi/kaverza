<script setup lang="ts">
// --- Meta -------------------------------------------------------------
useHead({ title: "Вхід" });

// --- Composables ------------------------------------------------------
const { refresh } = useAuth();

// --- Variables ------------------------------------------------------
const error = ref("");
const isLoading = ref(false);
const { errors: fieldErrors, clearErrors, setErrors } = useFormErrors();

const form = ref({
  name: "",
  password: "",
});

// --- Methods ---------------------------------------------------------
const submit = async () => {
  error.value = "";
  clearErrors();

  try {
    isLoading.value = true;
    await $fetch("/api/login", {
      method: "POST",
      body: form.value,
    });

    await refresh();
    await navigateTo("/");
  } catch (e: unknown) {
    error.value = setErrors(e) ?? "Щось пішло не так";
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="mx-auto flex w-full max-w-sm flex-col gap-5 py-4">
    <div>
      <h1>Вхід</h1>
      <p class="mt-1 text-base text-muted">Увійдіть, щоб додавати ігри.</p>
    </div>

    <div class="card">
      <LazyUiForm
        v-model="form"
        :fields="[
          { name: 'name', type: 'text', label: 'Ім\'я' },
          { name: 'password', type: 'password', label: 'Пароль' },
        ]"
        :errors="fieldErrors"
        submit-text="Увійти"
        :loading="isLoading"
        @submit-form="submit"
      />
    </div>

    <div v-if="error" class="alert alert-danger" role="alert">{{ error }}</div>

    <p class="text-base text-muted">
      Немає акаунта?
      <NuxtLink to="/register" class="link">Зареєструватися</NuxtLink>
    </p>
  </div>
</template>
