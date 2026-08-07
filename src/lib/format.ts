export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("pt-PT");
}

export function formatDateTime(date: Date | string) {
  return new Date(date).toLocaleString("pt-PT", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function formatCurrency(value: number | string) {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
  }).format(Number(value));
}

export const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];
