import { inputClass, labelClass, cardClass } from "@/components/form-styles";
import { buttonStyles } from "@/components/button-styles";

export default function InterventionForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  defaultValues?: { name?: string; basePrice?: string };
  submitLabel: string;
}) {
  return (
    <form action={action} className={`space-y-4 p-6 ${cardClass}`}>
      <div>
        <label htmlFor="name" className={labelClass}>
          Nome da intervenção
        </label>
        <input
          id="name"
          name="name"
          required
          placeholder="Ex: Administração de injetável"
          defaultValue={defaultValues?.name}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="basePrice" className={labelClass}>
          Preço base (mão de obra, €)
        </label>
        <input
          id="basePrice"
          name="basePrice"
          type="number"
          step="0.01"
          min="0"
          required
          defaultValue={defaultValues?.basePrice}
          className={inputClass}
        />
        <p className="mt-1 text-xs text-stone-400">
          Os materiais usados são cobrados à parte, adicionados ao preço base.
        </p>
      </div>
      <button type="submit" className={buttonStyles.primary}>
        {submitLabel}
      </button>
    </form>
  );
}
