export type Locale = 'en' | 'es'

export const DEFAULT_LOCALE: Locale = 'en'

export type Messages = {
  tab_list: string
  tab_results: string
  results_per_search: string
  search: string
  clear: string
  download: string
  download_selected: string
  selected_count: string
  select_all_main: string
  tracks_label: string
  results_title: string
  column_select?: string
  column_query: string
  column_best: string
  column_score: string
  column_dl: string
  column_actions: string
  loading: string
  no_results: string
  see_more: string
  results_for: (q: string) => string
  dl_free: string
  dl_off: string
  footer_created_by: string
  footer_clone_project: string
  footer_improve_project: string
}

export const STRINGS: Record<Locale, Messages> = {
  en: {
    tab_list: 'List',
    tab_results: 'Results',
    results_per_search: 'Results per search',
    search: 'Search',
    clear: 'Clear',
    download: 'Download',
    download_selected: 'Download selected',
    selected_count: 'Selected',
    select_all_main: 'All main',
    tracks_label: 'Tracklist (one per line)',
    results_title: 'Results',
    column_query: 'Query',
    column_select: 'Select',
    column_best: 'Best match',
    column_score: 'Score',
    column_dl: 'DL',
    column_actions: 'Actions',
    loading: 'Loading…',
    no_results: 'No results',
    see_more: 'See more',
    results_for: (q: string) => `Results for "${q}"`,
    dl_free: 'Free',
    dl_off: 'Off',
    footer_created_by: 'Created by',
    footer_clone_project: 'Clone this project to improve it or add personal touches',
    footer_improve_project: 'Improve this project',
  },
  es: {
    tab_list: 'Listado',
    tab_results: 'Resultados',
    results_per_search: 'Resultados por búsqueda',
    search: 'Buscar',
    clear: 'Limpiar',
    download: 'Descargar',
    download_selected: 'Descargar seleccionados',
    selected_count: 'Seleccionados',
    select_all_main: 'Todos (mejores)',
    tracks_label: 'Listado de tracks (uno por línea)',
    results_title: 'Resultados',
    column_query: 'Query',
    column_select: 'Seleccionar',
    column_best: 'Mejor match',
    column_score: 'Score',
    column_dl: 'DL',
    column_actions: 'Acciones',
    loading: 'Cargando…',
    no_results: 'Sin resultados',
    see_more: 'Ver más',
    results_for: (q: string) => `Resultados para "${q}"`,
    dl_free: 'Free',
    dl_off: 'Off',
    footer_created_by: 'Creado por',
    footer_clone_project: 'Clona este proyecto para mejorarlo o darle toques personales',
    footer_improve_project: 'Mejora este proyecto',
  },
}

const STORAGE_KEY = 'locale'

export function getSavedLocale(): Locale {
  const fromStorage = localStorage.getItem(STORAGE_KEY) as Locale | null
  return fromStorage ?? DEFAULT_LOCALE
}

export function saveLocale(locale: Locale): void {
  localStorage.setItem(STORAGE_KEY, locale)
}


