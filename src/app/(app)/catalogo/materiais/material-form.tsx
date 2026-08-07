import { inputClass, labelClass, cardClass } from "@/components/form-styles";
import { buttonStyles } from "@/components/button-styles";

export default function MaterialForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  defaultValues?: { name?: string; unit?: string; unitPrice?: string };
  submitLabel: string;
}) {
  return (
    <form action={action} className={`space-y-4 p-6 ${cardClass}`}>
      <div>
        <label htmlFor="name" className={labelClass}>
          Nome do material
        </label>
        <input
          id="name"
          name="name"
          required
          placeholder="Ex: Seringa 5ml"
          defaultValue={defaultValues?.name}
          className={inputClass}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="unit" className={labelClass}>
            Unidade
          </label>
          <input
            id="unit"
            name="unit"
            placeholder="un, ml, caixa..."
            defaultValue={defaultValues?.unit ?? "un"}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="unitPrice" className={labelClass}>
            Preço unitário (€)
          </label>
          <input
            id="unitPrice"
            name="unitPrice"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={defaultValues?.unitPrice}
            className={inputClass}
          />
        </div>
      </div>
      <button type="submit" className={buttonStyles.primary}>
        {submitLabel}
      </button>
    </form>
  );
}
