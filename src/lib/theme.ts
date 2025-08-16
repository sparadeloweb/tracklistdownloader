export type ThemeColor =
  | 'red'
  | 'orange'
  | 'amber'
  | 'yellow'
  | 'lime'
  | 'green'
  | 'emerald'
  | 'teal'
  | 'cyan'
  | 'sky'
  | 'blue'
  | 'indigo'
  | 'violet'
  | 'purple'
  | 'fuchsia'
  | 'pink'
  | 'rose'

export const THEME_COLORS: ThemeColor[] = [
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose',
]

export const COLOR_HEX: Record<ThemeColor, { '700': string; '100': string; '500': string }> = {
  red: { '700': '#b91c1c', '100': '#fee2e2', '500': '#ef4444' },
  orange: { '700': '#c2410c', '100': '#ffedd5', '500': '#f97316' },
  amber: { '700': '#b45309', '100': '#fef3c7', '500': '#f59e0b' },
  yellow: { '700': '#a16207', '100': '#fef9c3', '500': '#eab308' },
  lime: { '700': '#3f6212', '100': '#ecfccb', '500': '#84cc16' },
  green: { '700': '#15803d', '100': '#dcfce7', '500': '#22c55e' },
  emerald: { '700': '#047857', '100': '#d1fae5', '500': '#10b981' },
  teal: { '700': '#0f766e', '100': '#ccfbf1', '500': '#14b8a6' },
  cyan: { '700': '#0e7490', '100': '#cffafe', '500': '#06b6d4' },
  sky: { '700': '#0369a1', '100': '#e0f2fe', '500': '#0ea5e9' },
  blue: { '700': '#1d4ed8', '100': '#dbeafe', '500': '#3b82f6' },
  indigo: { '700': '#4338ca', '100': '#e0e7ff', '500': '#6366f1' },
  violet: { '700': '#6d28d9', '100': '#ede9fe', '500': '#8b5cf6' },
  purple: { '700': '#7e22ce', '100': '#f3e8ff', '500': '#a855f7' },
  fuchsia: { '700': '#a21caf', '100': '#fae8ff', '500': '#d946ef' },
  pink: { '700': '#be185d', '100': '#fce7f3', '500': '#ec4899' },
  rose: { '700': '#be123c', '100': '#ffe4e6', '500': '#f43f5e' },
}

export const PRESET_CLASSES: Record<
  ThemeColor,
  {
    buttonPrimary: string
    buttonSecondary: string
    buttonGhost: string
    input: string
    dot: string
    cardBorder: string
    tabsTrigger: string
  }
> = {
  red: {
    buttonPrimary:
      'bg-red-700/40 hover:bg-red-700/50 text-red-100 border border-red-400/30 focus-visible:ring-red-500/40',
    buttonSecondary: 'bg-red-700/20 hover:bg-red-700/30 text-red-100 border border-red-400/30',
    buttonGhost: 'bg-red-700/10 hover:bg-red-700/20 text-red-100',
    input:
      'bg-red-700/20 text-red-100 placeholder:text-red-100/60 border-red-400/30 focus-visible:ring-red-500/40',
    dot: 'bg-red-500',
    cardBorder: 'border border-red-400/30',
    tabsTrigger: 'data-[state=active]:bg-red-700 data-[state=active]:text-red-100',
  },
  orange: {
    buttonPrimary:
      'bg-orange-700/40 hover:bg-orange-700/50 text-orange-100 border border-orange-400/30 focus-visible:ring-orange-500/40',
    buttonSecondary: 'bg-orange-700/20 hover:bg-orange-700/30 text-orange-100 border border-orange-400/30',
    buttonGhost: 'bg-orange-700/10 hover:bg-orange-700/20 text-orange-100',
    input:
      'bg-orange-700/20 text-orange-100 placeholder:text-orange-100/60 border-orange-400/30 focus-visible:ring-orange-500/40',
    dot: 'bg-orange-500',
    cardBorder: 'border border-orange-400/30',
    tabsTrigger: 'data-[state=active]:bg-orange-700 data-[state=active]:text-orange-100',
  },
  amber: {
    buttonPrimary:
      'bg-amber-700/40 hover:bg-amber-700/50 text-amber-100 border border-amber-400/30 focus-visible:ring-amber-500/40',
    buttonSecondary: 'bg-amber-700/20 hover:bg-amber-700/30 text-amber-100 border border-amber-400/30',
    buttonGhost: 'bg-amber-700/10 hover:bg-amber-700/20 text-amber-100',
    input:
      'bg-amber-700/20 text-amber-100 placeholder:text-amber-100/60 border-amber-400/30 focus-visible:ring-amber-500/40',
    dot: 'bg-amber-500',
    cardBorder: 'border border-amber-400/30',
    tabsTrigger: 'data-[state=active]:bg-amber-700 data-[state=active]:text-amber-100',
  },
  yellow: {
    buttonPrimary:
      'bg-yellow-700/40 hover:bg-yellow-700/50 text-yellow-100 border border-yellow-400/30 focus-visible:ring-yellow-500/40',
    buttonSecondary: 'bg-yellow-700/20 hover:bg-yellow-700/30 text-yellow-100 border border-yellow-400/30',
    buttonGhost: 'bg-yellow-700/10 hover:bg-yellow-700/20 text-yellow-100',
    input:
      'bg-yellow-700/20 text-yellow-100 placeholder:text-yellow-100/60 border-yellow-400/30 focus-visible:ring-yellow-500/40',
    dot: 'bg-yellow-500',
    cardBorder: 'border border-yellow-400/30',
    tabsTrigger: 'data-[state=active]:bg-yellow-700 data-[state=active]:text-yellow-100',
  },
  lime: {
    buttonPrimary:
      'bg-lime-700/40 hover:bg-lime-700/50 text-lime-100 border border-lime-400/30 focus-visible:ring-lime-500/40',
    buttonSecondary: 'bg-lime-700/20 hover:bg-lime-700/30 text-lime-100 border border-lime-400/30',
    buttonGhost: 'bg-lime-700/10 hover:bg-lime-700/20 text-lime-100',
    input:
      'bg-lime-700/20 text-lime-100 placeholder:text-lime-100/60 border-lime-400/30 focus-visible:ring-lime-500/40',
    dot: 'bg-lime-500',
    cardBorder: 'border border-lime-400/30',
    tabsTrigger: 'data-[state=active]:bg-lime-700 data-[state=active]:text-lime-100',
  },
  green: {
    buttonPrimary:
      'bg-green-700/40 hover:bg-green-700/50 text-green-100 border border-green-400/30 focus-visible:ring-green-500/40',
    buttonSecondary: 'bg-green-700/20 hover:bg-green-700/30 text-green-100 border border-green-400/30',
    buttonGhost: 'bg-green-700/10 hover:bg-green-700/20 text-green-100',
    input:
      'bg-green-700/20 text-green-100 placeholder:text-green-100/60 border-green-400/30 focus-visible:ring-green-500/40',
    dot: 'bg-green-500',
    cardBorder: 'border border-green-400/30',
    tabsTrigger: 'data-[state=active]:bg-green-700 data-[state=active]:text-green-100',
  },
  emerald: {
    buttonPrimary:
      'bg-emerald-700/40 hover:bg-emerald-700/50 text-emerald-100 border border-emerald-400/30 focus-visible:ring-emerald-500/40',
    buttonSecondary: 'bg-emerald-700/20 hover:bg-emerald-700/30 text-emerald-100 border border-emerald-400/30',
    buttonGhost: 'bg-emerald-700/10 hover:bg-emerald-700/20 text-emerald-100',
    input:
      'bg-emerald-700/20 text-emerald-100 placeholder:text-emerald-100/60 border-emerald-400/30 focus-visible:ring-emerald-500/40',
    dot: 'bg-emerald-500',
    cardBorder: 'border border-emerald-400/30',
    tabsTrigger: 'data-[state=active]:bg-emerald-700 data-[state=active]:text-emerald-100',
  },
  teal: {
    buttonPrimary:
      'bg-teal-700/40 hover:bg-teal-700/50 text-teal-100 border border-teal-400/30 focus-visible:ring-teal-500/40',
    buttonSecondary: 'bg-teal-700/20 hover:bg-teal-700/30 text-teal-100 border border-teal-400/30',
    buttonGhost: 'bg-teal-700/10 hover:bg-teal-700/20 text-teal-100',
    input:
      'bg-teal-700/20 text-teal-100 placeholder:text-teal-100/60 border-teal-400/30 focus-visible:ring-teal-500/40',
    dot: 'bg-teal-500',
    cardBorder: 'border border-teal-400/30',
    tabsTrigger: 'data-[state=active]:bg-teal-700 data-[state=active]:text-teal-100',
  },
  cyan: {
    buttonPrimary:
      'bg-cyan-700/40 hover:bg-cyan-700/50 text-cyan-100 border border-cyan-400/30 focus-visible:ring-cyan-500/40',
    buttonSecondary: 'bg-cyan-700/20 hover:bg-cyan-700/30 text-cyan-100 border border-cyan-400/30',
    buttonGhost: 'bg-cyan-700/10 hover:bg-cyan-700/20 text-cyan-100',
    input:
      'bg-cyan-700/20 text-cyan-100 placeholder:text-cyan-100/60 border-cyan-400/30 focus-visible:ring-cyan-500/40',
    dot: 'bg-cyan-500',
    cardBorder: 'border border-cyan-400/30',
    tabsTrigger: 'data-[state=active]:bg-cyan-700 data-[state=active]:text-cyan-100',
  },
  sky: {
    buttonPrimary:
      'bg-sky-700/40 hover:bg-sky-700/50 text-sky-100 border border-sky-400/30 focus-visible:ring-sky-500/40',
    buttonSecondary: 'bg-sky-700/20 hover:bg-sky-700/30 text-sky-100 border border-sky-400/30',
    buttonGhost: 'bg-sky-700/10 hover:bg-sky-700/20 text-sky-100',
    input:
      'bg-sky-700/20 text-sky-100 placeholder:text-sky-100/60 border-sky-400/30 focus-visible:ring-sky-500/40',
    dot: 'bg-sky-500',
    cardBorder: 'border border-sky-400/30',
    tabsTrigger: 'data-[state=active]:bg-sky-700 data-[state=active]:text-sky-100',
  },
  blue: {
    buttonPrimary:
      'bg-blue-700/40 hover:bg-blue-700/50 text-blue-100 border border-blue-400/30 focus-visible:ring-blue-500/40',
    buttonSecondary: 'bg-blue-700/20 hover:bg-blue-700/30 text-blue-100 border border-blue-400/30',
    buttonGhost: 'bg-blue-700/10 hover:bg-blue-700/20 text-blue-100',
    input:
      'bg-blue-700/20 text-blue-100 placeholder:text-blue-100/60 border-blue-400/30 focus-visible:ring-blue-500/40',
    dot: 'bg-blue-500',
    cardBorder: 'border border-blue-400/30',
    tabsTrigger: 'data-[state=active]:bg-blue-700 data-[state=active]:text-blue-100',
  },
  indigo: {
    buttonPrimary:
      'bg-indigo-700/40 hover:bg-indigo-700/50 text-indigo-100 border border-indigo-400/30 focus-visible:ring-indigo-500/40',
    buttonSecondary: 'bg-indigo-700/20 hover:bg-indigo-700/30 text-indigo-100 border border-indigo-400/30',
    buttonGhost: 'bg-indigo-700/10 hover:bg-indigo-700/20 text-indigo-100',
    input:
      'bg-indigo-700/20 text-indigo-100 placeholder:text-indigo-100/60 border-indigo-400/30 focus-visible:ring-indigo-500/40',
    dot: 'bg-indigo-500',
    cardBorder: 'border border-indigo-400/30',
    tabsTrigger: 'data-[state=active]:bg-indigo-700 data-[state=active]:text-indigo-100',
  },
  violet: {
    buttonPrimary:
      'bg-violet-700/40 hover:bg-violet-700/50 text-violet-100 border border-violet-400/30 focus-visible:ring-violet-500/40',
    buttonSecondary: 'bg-violet-700/20 hover:bg-violet-700/30 text-violet-100 border border-violet-400/30',
    buttonGhost: 'bg-violet-700/10 hover:bg-violet-700/20 text-violet-100',
    input:
      'bg-violet-700/20 text-violet-100 placeholder:text-violet-100/60 border-violet-400/30 focus-visible:ring-violet-500/40',
    dot: 'bg-violet-500',
    cardBorder: 'border border-violet-400/30',
    tabsTrigger: 'data-[state=active]:bg-violet-700 data-[state=active]:text-violet-100',
  },
  purple: {
    buttonPrimary:
      'bg-purple-700/40 hover:bg-purple-700/50 text-purple-100 border border-purple-400/30 focus-visible:ring-purple-500/40',
    buttonSecondary: 'bg-purple-700/20 hover:bg-purple-700/30 text-purple-100 border border-purple-400/30',
    buttonGhost: 'bg-purple-700/10 hover:bg-purple-700/20 text-purple-100',
    input:
      'bg-purple-700/20 text-purple-100 placeholder:text-purple-100/60 border-purple-400/30 focus-visible:ring-purple-500/40',
    dot: 'bg-purple-500',
    cardBorder: 'border border-purple-400/30',
    tabsTrigger: 'data-[state=active]:bg-purple-700 data-[state=active]:text-purple-100',
  },
  fuchsia: {
    buttonPrimary:
      'bg-fuchsia-700/40 hover:bg-fuchsia-700/50 text-fuchsia-100 border border-fuchsia-400/30 focus-visible:ring-fuchsia-500/40',
    buttonSecondary: 'bg-fuchsia-700/20 hover:bg-fuchsia-700/30 text-fuchsia-100 border border-fuchsia-400/30',
    buttonGhost: 'bg-fuchsia-700/10 hover:bg-fuchsia-700/20 text-fuchsia-100',
    input:
      'bg-fuchsia-700/20 text-fuchsia-100 placeholder:text-fuchsia-100/60 border-fuchsia-400/30 focus-visible:ring-fuchsia-500/40',
    dot: 'bg-fuchsia-500',
    cardBorder: 'border border-fuchsia-400/30',
    tabsTrigger: 'data-[state=active]:bg-fuchsia-700 data-[state=active]:text-fuchsia-100',
  },
  pink: {
    buttonPrimary:
      'bg-pink-700/40 hover:bg-pink-700/50 text-pink-100 border border-pink-400/30 focus-visible:ring-pink-500/40',
    buttonSecondary: 'bg-pink-700/20 hover:bg-pink-700/30 text-pink-100 border border-pink-400/30',
    buttonGhost: 'bg-pink-700/10 hover:bg-pink-700/20 text-pink-100',
    input:
      'bg-pink-700/20 text-pink-100 placeholder:text-pink-100/60 border-pink-400/30 focus-visible:ring-pink-500/40',
    dot: 'bg-pink-500',
    cardBorder: 'border border-pink-400/30',
    tabsTrigger: 'data-[state=active]:bg-pink-700 data-[state=active]:text-pink-100',
  },
  rose: {
    buttonPrimary:
      'bg-rose-700/40 hover:bg-rose-700/50 text-rose-100 border border-rose-400/30 focus-visible:ring-rose-500/40',
    buttonSecondary: 'bg-rose-700/20 hover:bg-rose-700/30 text-rose-100 border border-rose-400/30',
    buttonGhost: 'bg-rose-700/10 hover:bg-rose-700/20 text-rose-100',
    input:
      'bg-rose-700/20 text-rose-100 placeholder:text-rose-100/60 border-rose-400/30 focus-visible:ring-rose-500/40',
    dot: 'bg-rose-500',
    cardBorder: 'border border-rose-400/30',
    tabsTrigger: 'data-[state=active]:bg-rose-700 data-[state=active]:text-rose-100',
  },
}

export function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '')
  const bigint = parseInt(h, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}


