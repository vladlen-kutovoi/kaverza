<script setup lang="ts">
// --- Meta -----------------------------------------------------------
definePageMeta({
  layout: "admin",
});

useHead({ title: "Додати персонажа" });

// --- Variables ------------------------------------------------------
const error = ref("");
const success = ref("");
const isLoading = ref(false);
const { errors: fieldErrors, clearErrors, setErrors } = useFormErrors();

const form = ref({
  name: "",
  color: "#6366f1",
});

// --- Methods ---------------------------------------------------------
const addChar = async () => {
  error.value = "";
  success.value = "";
  clearErrors();

  try {
    isLoading.value = true;
    const character = await $fetch("/api/characters", {
      method: "POST",
      body: form.value,
    });

    success.value = `Персонажа "${character?.name}" створено!`;
    form.value = {
      name: "",
      color: "#6366f1",
    };
  } catch (e: unknown) {
    error.value = setErrors(e) ?? "Щось пішло не так";
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="mx-auto flex w-full max-w-sm flex-col gap-5">
    <div>
      <h1>Додати персонажа</h1>
      <p class="mt-1 text-base text-muted">
        Колір використовується як позначка персонажа на сайті.
      </p>
    </div>

    <div class="card">
      <LazyUiForm
        v-model="form"
        :fields="[
          { name: 'name', type: 'text', label: 'Ім\'я' },
          { name: 'color', type: 'color', label: 'Колір' },
        ]"
        :errors="fieldErrors"
        submit-text="Додати"
        :loading="isLoading"
        @submit-form="addChar"
      />
    </div>

    <div v-if="error" class="alert alert-danger" role="alert">{{ error }}</div>
    <div v-if="success" class="alert alert-success" role="status">
      {{ success }}
    </div>
  </div>
</template>
