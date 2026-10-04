type FormValidationIssue = {
  path?: unknown[];
  message?: unknown;
};

type FormError = {
  data?: {
    issues?: unknown;
  };
  statusMessage?: unknown;
};

type FormRequestError = {
  data?: FormError;
};

export const useFormErrors = () => {
  const errors = ref<Record<string, string>>({});

  const clearErrors = () => {
    errors.value = {};
  };

  const setErrors = (error: unknown): string | undefined => {
    clearErrors();

    if (!error || typeof error !== "object") {
      return;
    }

    const response = error as FormRequestError;
    const formError = response.data;
    const issues = formError?.data?.issues;
    let hasFieldErrors = false;

    if (Array.isArray(issues)) {
      for (const issue of issues) {
        if (!issue || typeof issue !== "object") {
          continue;
        }

        const validationIssue = issue as FormValidationIssue;
        const fieldName = validationIssue.path?.[0];
        if (
          typeof fieldName === "string" &&
          typeof validationIssue.message === "string"
        ) {
          errors.value[fieldName] = validationIssue.message;
          hasFieldErrors = true;
        }
      }
    }

    if (hasFieldErrors) {
      return;
    }

    return typeof formError?.statusMessage === "string"
      ? formError.statusMessage
      : undefined;
  };

  return {
    errors,
    clearErrors,
    setErrors,
  };
};
