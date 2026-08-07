import { Plus, X } from "lucide-react";
import { inputClass, cardClass } from "@/components/form-styles";
import { buttonStyles } from "@/components/button-styles";

type Item = { linkId: string; name: string; notes: string | null };
type Option = { id: string; name: string };

export default function NursingItemsSection({
  title,
  items,
  availableOptions,
  selectFieldName,
  addAction,
  removeAction,
  emptyLabel,
  addLabel,
}: {
  title: string;
  items: Item[];
  availableOptions: Option[];
  selectFieldName: string;
  addAction: (formData: FormData) => void;
  removeAction: (linkId: string) => void;
  emptyLabel: string;
  addLabel: string;
}) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-medium text-stone-700">{title}</h3>
      <div className={cardClass}>
        <ul className="divide-y divide-stone-100">
          {items.map((item) => (
            <li key={item.linkId} className="flex items-start justify-between gap-3 px-4 py-2.5">
              <div>
                <p className="text-sm text-stone-800">{item.name}</p>
                {item.notes && <p className="text-xs text-stone-400">{item.notes}</p>}
              </div>
              <form action={removeAction.bind(null, item.linkId)}>
                <button type="submit" className="text-stone-400 hover:text-red-600" title="Remover">
                  <X size={15} />
                </button>
              </form>
            </li>
          ))}
          {items.length === 0 && (
            <li className="px-4 py-4 text-center text-sm text-stone-400">{emptyLabel}</li>
          )}
        </ul>

        {availableOptions.length > 0 && (
          <form
            action={addAction}
            className="flex flex-wrap items-end gap-2 border-t border-stone-100 px-4 py-3"
          >
            <select name={selectFieldName} required className={`flex-1 min-w-[180px] ${inputClass}`}>
              {availableOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
            <input
              name="notes"
              placeholder="Nota (opcional)"
              className={`flex-1 min-w-[140px] ${inputClass}`}
            />
            <button type="submit" className={buttonStyles.ghost}>
              <Plus size={14} /> {addLabel}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
