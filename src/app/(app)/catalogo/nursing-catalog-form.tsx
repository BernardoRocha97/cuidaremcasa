import { inputClass, labelClass, cardClass } from "@/components/form-styles";
import { buttonStyles } from "@/components/button-styles";

export default function NursingCatalogForm({
  action,
  defaultValues,
  submitLabel,
  namePlaceholder,
}: {
  action: (formData: FormData) => void;
  defaultValues?: { name?: string; description?: string };
  submitLabel: string;
  namePlaceholder?: string;
}) {
  return (
    <form action={action} className={`space-y-4 p-6 ${cardClass}`}>
      <div>
        <label htmlFor="name" className={labelClass}>
          Nome
        </label>
        <input
          id="name"
          name="name"
          required
          placeholder={namePlaceholder}
          defaultValue={defaultValues?.name}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="description" className={labelClass}>
          Descrição (opcional)
        </label>
        <textarea
          id="description"
          name="description"
          rows={2}
          defaultValue={defaultValues?.description}
          className={inputClass}
        />
      </div>
      <button type="submit" className={buttonStyles.primary}>
        {submitLabel}
      </button>
    </form>
  );
}
