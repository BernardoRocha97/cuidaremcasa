import { inputClass, labelClass, cardClass } from "@/components/form-styles";
import { buttonStyles } from "@/components/button-styles";
import { formatCurrency } from "@/lib/format";

type Option = { id: string; name: string };
type InterventionOption = { id: string; name: string; basePrice: string };

export default function VisitForm({
  action,
  patients,
  nurses,
  interventionTypes,
  defaultValues,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  patients: Option[];
  nurses: Option[];
  interventionTypes: InterventionOption[];
  defaultValues?: {
    patientId?: string;
    nurseId?: string;
    scheduledDate?: string;
    scheduledTime?: string;
    notes?: string;
    interventionTypeIds?: string[];
  };
  submitLabel: string;
}) {
  const selected = new Set(defaultValues?.interventionTypeIds ?? []);

  return (
    <form action={action} className={`space-y-4 p-6 ${cardClass}`}>
      <div>
        <label htmlFor="patientId" className={labelClass}>
          Utente
        </label>
        <select
          id="patientId"
          name="patientId"
          required
          defaultValue={defaultValues?.patientId}
          className={inputClass}
        >
          <option value="">Selecionar utente...</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="nurseId" className={labelClass}>
          Enfermeiro
        </label>
        <select
          id="nurseId"
          name="nurseId"
          defaultValue={defaultValues?.nurseId}
          className={inputClass}
        >
          <option value="">Por atribuir</option>
          {nurses.map((n) => (
            <option key={n.id} value={n.id}>
              {n.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="scheduledDate" className={labelClass}>
            Data
          </label>
          <input
            id="scheduledDate"
            name="scheduledDate"
            type="date"
            required
            defaultValue={defaultValues?.scheduledDate}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="scheduledTime" className={labelClass}>
            Hora
          </label>
          <input
            id="scheduledTime"
            name="scheduledTime"
            type="time"
            required
            defaultValue={defaultValues?.scheduledTime}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <span className={labelClass}>Intervenções planeadas</span>
        <div className="mt-1 space-y-1.5 rounded-lg border border-stone-300 p-3">
          {interventionTypes.map((type) => (
            <label key={type.id} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="interventionTypeIds"
                  value={type.id}
                  defaultChecked={selected.has(type.id)}
                  className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                />
                {type.name}
              </span>
              <span className="text-stone-400">{formatCurrency(type.basePrice)}</span>
            </label>
          ))}
          {interventionTypes.length === 0 && (
            <p className="text-sm text-stone-400">
              Ainda não há intervenções no catálogo. Cria-as em Catálogo → Nova intervenção.
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="notes" className={labelClass}>
          Notas
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={defaultValues?.notes}
          className={inputClass}
        />
      </div>

      <button type="submit" className={buttonStyles.primary}>
        {submitLabel}
      </button>
    </form>
  );
}
