import { HeartHandshake } from "lucide-react";

export default function Brand({ dark = true }: { dark?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600">
        <HeartHandshake size={18} className="text-white" strokeWidth={2.25} />
      </span>
      <span className={`text-[15px] font-semibold tracking-tight ${dark ? "text-white" : "text-stone-900"}`}>
        Cuidar em Casa
      </span>
    </div>
  );
}
