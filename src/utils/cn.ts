/** Склеивает классы, пропуская пустые значения: cn(s.btn, active && s['btn--active']) */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}
