interface FormBaseField {
  name: string;
  label: string;
}

interface FormSimpleField extends FormBaseField {
  type: "text" | "password" | "color";
}

interface FormSearchField extends FormBaseField {
  type: "search";
  optionLabel: string;
  options: Record<string, unknown>[];
}

/** Picks one of the bundled profile pictures. No options to pass - the
    set comes from shared/utils/avatars.ts. */
interface FormAvatarField extends FormBaseField {
  type: "avatar";
}

type Option = Record<string, unknown>;
type SearchFieldValue = Option | null;
type FormField = FormSimpleField | FormSearchField | FormAvatarField;

export type { FormField, SearchFieldValue, Option };
