<script setup lang="ts">
// --- Imports ----------------------------------------------------------
import { randomAvatar } from "#shared/utils/avatars";

// --- Meta -------------------------------------------------------------
useHead({ title: "Реєстрація" });

// --- Composables ------------------------------------------------------
const { refresh } = useAuth();

// --- Variables ------------------------------------------------------
const error = ref("");
const isLoading = ref(false);
const { errors: fieldErrors, clearErrors, setErrors } = useFormErrors();

// A portrait is picked for them up front, so the field is never empty and
// choosing one is optional rather than another step to get through.
const form = ref({
  name: "",
  avatar: randomAvatar(),
  password: "",
  passwordConfirmation: "",
});

// --- Methods ---------------------------------------------------------
const register = async () => {
  error.value = "";
  clearErrors();

  try {
    isLoading.value = true;
    // Сервер ставить cookie сесії, тож гравець уже увійшов
    await $fetch("/api/players", {
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
      <h1>Реєстрація</h1>
      <p class="mt-1 text-base text-muted">Створіть гравця, щоб вести облік.</p>
    </div>

    <div class="card">
      <LazyUiForm
        v-model="form"
        :fields="[
          { name: 'name', type: 'text', label: 'Ім\'я' },
          { name: 'avatar', type: 'avatar', label: 'Аватар' },
          { name: 'password', type: 'password', label: 'Пароль' },
          {
            name: 'passwordConfirmation',
            type: 'password',
            label: 'Підтвердження пароля',
          },
        ]"
        :errors="fieldErrors"
        submit-text="Зареєструватися"
        :loading="isLoading"
        @submit-form="register"
      />
    </div>

    <div v-if="error" class="alert alert-danger" role="alert">{{ error }}</div>

    <p class="text-base text-muted">
      Вже є акаунт? <NuxtLink to="/login" class="link">Увійти</NuxtLink>
    </p>
  </div>
</template>
