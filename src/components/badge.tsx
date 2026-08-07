const VARIANTS = {
  neutral: "bg-stone-100 text-stone-600",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-red-700",
  info: "bg-sky-100 text-sky-700",
} as const;

export type BadgeVariant = keyof typeof VARIANTS;

export default function Badge({
  children,
  variant = "neutral",
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${VARIANTS[variant]}`}
    >
      {children}
    </span>
  );
}

export const VISIT_STATUS_VARIANT: Record<string, BadgeVariant> = {
  AGENDADA: "info",
  CONCLUIDA: "success",
  CANCELADA: "neutral",
  FALTA: "danger",
};

export const VISIT_STATUS_LABEL: Record<string, string> = {
  AGENDADA: "Agendada",
  CONCLUIDA: "Concluída",
  CANCELADA: "Cancelada",
  FALTA: "Falta",
};

export const INVOICE_STATUS_VARIANT: Record<string, BadgeVariant> = {
  PENDENTE: "warning",
  PAGA: "success",
  VENCIDA: "danger",
};

export const INVOICE_STATUS_LABEL: Record<string, string> = {
  PENDENTE: "Pendente",
  PAGA: "Paga",
  VENCIDA: "Vencida",
};
