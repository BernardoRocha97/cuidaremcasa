import type { LucideIcon } from "lucide-react";
import { cardClass } from "@/components/form-styles";

export default function StatCard({
  icon: Icon,
  label,
  value,
  tone = "emerald",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tone?: "emerald" | "amber" | "red" | "sky";
}) {
  const toneClass = {
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
    sky: "bg-sky-50 text-sky-600",
  }[tone];

  return (
    <div className={`flex items-start gap-4 p-5 ${cardClass}`}>
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${toneClass}`}>
        <Icon size={20} />
      </span>
      <div>
        <p className="text-sm text-stone-500">{label}</p>
        <p className="mt-0.5 text-2xl font-semibold text-stone-900">{value}</p>
      </div>
    </div>
  );
}
