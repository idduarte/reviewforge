/**
 * Single source of truth for brand colors.
 * Used by reportPrintStyles.mjs (PDF) and serves as reference for styles.css (web UI).
 *
 * Palette: neutral gray + PCB Blue accent (#1a5fa8)
 * Matches the Claude Design mockup exactly.
 */
export const brand = {
  // PCB Blue — accent only
  primary50:  '#eff4fb',
  primary100: '#dbe6f4',
  primary500: '#1a5fa8',
  primary600: '#124d8c',
  primary700: '#0c3868',

  // Neutrals — pure gray (no blue bleed)
  neutral50:  '#f4f6fa',
  neutral100: '#eef0f4',
  neutral200: '#e5e7eb',
  neutral300: '#d1d5db',
  neutral500: '#6b7280',
  neutral700: '#374151',
  neutral900: '#111827',

  // Semantic
  text:        '#111827',
  muted:       '#6b7280',
  border:      '#e5e7eb',
  soft:        '#f4f6fa',
  white:       '#ffffff',
  danger:      '#b42318',
  dangerSoft:  '#fff0ee',

  // PDF surface (always white/light — no dark mode in print)
  pdf: {
    text:        '#111827',
    muted:       '#6b7280',
    border:      '#e5e7eb',
    soft:        '#f4f6fa',
    primary:     '#124d8c',
    primaryDark: '#0c3868',
    accent:      '#1a5fa8',
  },
};
