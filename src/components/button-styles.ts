const base =
  "inline-flex items-center justify-center gap-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 disabled:pointer-events-none px-3.5 py-2";

export const buttonStyles = {
  primary: `${base} bg-emerald-600 text-white shadow-sm hover:bg-emerald-700`,
  secondary: `${base} border border-stone-300 bg-white text-stone-700 hover:bg-stone-50`,
  danger: `${base} border border-red-200 bg-white text-red-600 hover:bg-red-50`,
  ghost: `${base} text-stone-600 hover:bg-stone-100`,
};
