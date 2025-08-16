import './App.css'
import React, { useMemo, useState } from 'react'
// import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { Textarea } from './components/ui/textarea'
// import { Input } from './components/ui/input'
import { Button } from './components/ui/button'
import { Label } from './components/ui/label'
import { Badge } from './components/ui/badge'
// Dialog removido: expandimos inline los "ver más"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './components/ui/dropdown-menu'
import { Slider } from './components/ui/slider'
// import { Separator } from './components/ui/separator'
import { ExternalLink, Loader2, Search, Trash2, ChevronDown, ChevronUp, RotateCcw, CornerDownRight, Download, Play, Pause } from 'lucide-react'
import { findBestMatch, formatMs, searchTracks, scoreTrackMatch, enrichTracksDownloadInfo, type SoundCloudTrack, SOUND_CLOUD_CLIENT_ID } from './lib/soundcloud'
import Hls from 'hls.js'
import { PRESET_CLASSES, THEME_COLORS, type ThemeColor, COLOR_HEX, hexToRgba } from './lib/theme'
import { Checkbox } from './components/ui/checkbox'
import { STRINGS, type Locale, getSavedLocale, saveLocale } from './lib/i18n'
import logo from './assets/logo.png'

type Row = {
  originalQuery: string
  best?: SoundCloudTrack | null
  bestScore?: number
  candidates?: SoundCloudTrack[]
  loading: boolean
  error?: string
}

// Backend API base URL (configure via Vite env: VITE_TRACKLIST_API_BASE)
const API_BASE: string = (import.meta as any).env?.VITE_TRACKLIST_API_BASE || 'https://tracklistdownloader-api.dq97zj.easypanel.host/'

export default function App() {
  // Client ID fijo para una sola app (lee desde soundcloud.ts)
  const clientId = SOUND_CLOUD_CLIENT_ID ?? ''
  const [rawList, setRawList] = useState<string>('')
  const [rows, setRows] = useState<Row[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [themeColor, setThemeColor] = useState<ThemeColor>(() => (localStorage.getItem('theme_color') as ThemeColor) || 'orange')
  const [resultsLimit, setResultsLimit] = useState<number>(10)
  const [locale, setLocale] = useState<Locale>(() => getSavedLocale())
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set<number>())
  const [selectedForBulk, setSelectedForBulk] = useState<Record<string, { id: number; title: string; permalink_url: string }>>({})
  const [downloading, setDownloading] = useState<Set<string>>(new Set<string>())
  const [bulkDownloading, setBulkDownloading] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<'listado' | 'resultados'>('listado')
  const [progressTotal, setProgressTotal] = useState<number>(0)
  const [progressDone, setProgressDone] = useState<number>(0)
  // removed Only Free filter per spec
  const [playerUrl, setPlayerUrl] = useState<string | null>(null)
  const [playerKind, setPlayerKind] = useState<'progressive' | 'hls' | 'unknown'>('unknown')
  const audioRef = React.useRef<HTMLAudioElement | null>(null)
  const hlsRef = React.useRef<Hls | null>(null)
  const currentTrackMetaRef = React.useRef<{ id: number; title?: string | null; user?: string | null } | null>(null)
  const playerBlobUrlRef = React.useRef<string | null>(null)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [duration, setDuration] = useState<number>(0)

  React.useEffect(() => {
    const audio = audioRef.current
    if (!playerUrl || !audio) return
    if (hlsRef.current) {
      if (import.meta.env.DEV) console.debug('[player] destroy previous hls instance')
      hlsRef.current.destroy()
      hlsRef.current = null
    }
    if (playerKind === 'hls' && Hls.isSupported()) {
      const hls = new Hls()
      hlsRef.current = hls
      if (import.meta.env.DEV) console.debug('[player] init hls', { url: playerUrl })
      hls.loadSource(playerUrl)
      hls.attachMedia(audio)
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (import.meta.env.DEV) console.debug('[player] HLS MANIFEST_PARSED')
        audio
          .play()
          .then(() => {
            setIsPlaying(true)
            if (import.meta.env.DEV) console.debug('[player] audio playing', { track: currentTrackMetaRef.current || undefined })
          })
          .catch((e) => {
            if (import.meta.env.DEV) console.debug('[player] audio play() error', { e, track: currentTrackMetaRef.current || undefined })
          })
      })
      hls.on(Hls.Events.ERROR, (_e, data) => {
        const payload = {
          type: data?.type,
          details: (data as any)?.details,
          fatal: (data as any)?.fatal,
          responseCode: (data as any)?.response?.code,
          responseText: (data as any)?.response?.text?.slice?.(0, 120),
          fragUrl: (data as any)?.frag?.url,
          url: (data as any)?.url,
          loader: (data as any)?.loader,
          track: currentTrackMetaRef.current || undefined,
        }
        if ((data as any)?.response?.code === 401) {
          console.error('[player] BLOCKED_401', payload)
        } else if ((data as any)?.response?.code) {
          console.warn('[player] HLS HTTP', payload)
        } else {
          if (import.meta.env.DEV) console.debug('[player] HLS ERROR', payload)
        }
      })
    } else {
      if (import.meta.env.DEV) console.debug('[player] set audio src (non-HLS)', { url: playerUrl, kind: playerKind })
      audio.src = playerUrl
      audio
        .play()
        .then(() => {
          setIsPlaying(true)
          if (import.meta.env.DEV) console.debug('[player] audio playing', { track: currentTrackMetaRef.current || undefined })
        })
        .catch((e) => {
          if (import.meta.env.DEV) console.debug('[player] audio play() error', { e, track: currentTrackMetaRef.current || undefined })
        })
    }
  }, [playerUrl, playerKind])

  React.useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onTime = () => setCurrentTime(audio.currentTime)
    const onMeta = () => setDuration(audio.duration || 0)
    const onEnded = () => setIsPlaying(false)
    const onError = () => {
      const err: any = (audio as any).error
      if (import.meta.env.DEV) console.debug('[player] <audio> error', {
        code: err?.code,
        message: err?.message,
        track: currentTrackMetaRef.current || undefined,
        src: audio.currentSrc,
      })
    }
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onMeta)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('error', onError)
    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onMeta)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('error', onError)
    }
  }, [])

  function togglePlayPause() {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      audio.play().then(() => setIsPlaying(true)).catch(() => {})
    } else {
      audio.pause()
      setIsPlaying(false)
    }
  }

  function handleScrub(value: number) {
    const audio = audioRef.current
    if (!audio || !duration) return
    audio.currentTime = Math.min(Math.max(0, value), duration)
    setCurrentTime(audio.currentTime)
  }

  function sanitizeRaw(input: string): string {
    const lines = input.split(/\r?\n/)
    const cleaned = lines.map((line) => {
      let out = line
      // Aplicar reglas iterativas para limpiar prefijos numéricos y timestamps comunes
      // 1) Numeración de lista: "01.", "01-", "01 .", "01 -", "01)"
      // 2) Timestamps: "mm:ss" o "h:mm:ss", opcional guión luego
      // 3) Guión sobrante al inicio
      const patterns: RegExp[] = [
        /^\s*\d+\s*[\.-]\s*/,      // 01.  o 01-
        /^\s*\d+\)\s*/,             // 01)
        /^\s*(?:\d{1,2}:){1,2}\d{2}\s*(?:[\-–—]\s*)?/, // 00:00 -  o 1:02:20 -
        /^\s*[\-–—]\s*/,             // guión suelto
      ]
      let changed = true
      while (changed) {
        changed = false
        for (const rx of patterns) {
          const next = out.replace(rx, '')
          if (next !== out) {
            out = next
            changed = true
          }
        }
      }
      return out
    })
    return cleaned.join('\n')
  }

  function persistThemeColor(color: ThemeColor) {
    setThemeColor(color)
    localStorage.setItem('theme_color', color)
    // Update background accents dynamically to match XCOLOR
    const color700 = COLOR_HEX[color]['700']
    const color500 = COLOR_HEX[color]['500']
    const color100 = COLOR_HEX[color]['100']
    document.body.style.backgroundImage = `radial-gradient(ellipse at 20% 10%, ${hexToRgba(color700, 0.10)} 0, transparent 40%), radial-gradient(ellipse at 80% 10%, ${hexToRgba(
      color500,
      0.08
    )} 0, transparent 40%), radial-gradient(ellipse at 10% 90%, ${hexToRgba(color100, 0.08)} 0, transparent 40%), radial-gradient(ellipse at 90% 90%, ${hexToRgba(
      color500,
      0.08
    )} 0, transparent 40%)`
    document.body.style.backgroundAttachment = 'fixed'
  }

  // Inicializar fondo con el color persistido
  React.useEffect(() => {
    persistThemeColor(themeColor)
    // Asegurar base oscura
    document.body.style.backgroundColor = 'oklch(0.12 0 0)'
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const queries = useMemo(() => {
    return rawList
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0)
  }, [rawList])

  // client_id es fijo; no editable desde UI

  async function handleSearchAll() {
    setIsSearching(true)
    const initial: Row[] = queries.map((q) => ({ originalQuery: q, loading: true }))
    setRows(initial)
    setActiveTab('resultados')
    setProgressTotal(initial.length)
    setProgressDone(0)
    try {
      const updates: Row[] = await Promise.all(
        initial.map(async (row) => {
          try {
            console.log('[handleSearch] Buscando para:', row.originalQuery)
            const resultsRaw = await searchTracks(row.originalQuery, resultsLimit)
            console.log('[handleSearch] Resultados raw:', resultsRaw)
            const results = await enrichTracksDownloadInfo(resultsRaw)
            console.log('[handleSearch] Resultados enriquecidos:', results)
            const { best, score } = findBestMatch(row.originalQuery, results)
            console.log('[handleSearch] Mejor match:', best, 'score:', score)
            const updated = {
              ...row,
              loading: false,
              best,
              bestScore: score,
              candidates: results,
            }
            console.log('[handleSearch] Row actualizada:', updated)
            setProgressDone((d) => d + 1)
            return updated
          } catch (err: any) {
            console.error('[handleSearch] Error:', err)
            setProgressDone((d) => d + 1)
            return { ...row, loading: false, error: err?.message ?? 'Error desconocido' }
          }
        })
      )
      setRows(updates)
    } finally {
      setIsSearching(false)
    }
  }

  async function handleRefreshRow(index: number) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, loading: true, error: undefined } : r)))
    try {
      const results = await enrichTracksDownloadInfo(await searchTracks(rows[index].originalQuery, resultsLimit))
      const { best, score } = findBestMatch(rows[index].originalQuery, results)
      setRows((prev) =>
        prev.map((r, i) => (i === index ? { ...r, loading: false, best, bestScore: score, candidates: results } : r))
      )
    } catch (err: any) {
      setRows((prev) => prev.map((r, i) => (i === index ? { ...r, loading: false, error: err?.message } : r)))
    }
  }

  // rows mostrados directamente

  return (
    <div className="min-h-screen">
      {/* Header sticky estilo dashboard */}
      <header className="sticky top-0 z-40 w-full backdrop-blur bg-background/40 rounded-lg">
          <div className="px-3 md:px-4 h-24 flex items-center justify-between w-full">
          <div className="flex items-center gap-6">
            <h1
              className="text-xl md:text-2xl font-bold tracking-tight"
              style={{ color: 'white' }}
            >
                <span
                  aria-label="Tracklist Downloader"
                  className="block h-30 md:h-48 w-[240px]"
                  style={{
                    backgroundColor: COLOR_HEX[themeColor]['500'],
                    WebkitMaskImage: `url(${logo})`,
                    maskImage: `url(${logo})`,
                    WebkitMaskRepeat: 'no-repeat',
                    maskRepeat: 'no-repeat',
                    WebkitMaskSize: 'contain',
                    maskSize: 'contain',
                    WebkitMaskPosition: 'left center',
                    maskPosition: 'left center',
                  }}
                />
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className={`h-8 border ${PRESET_CLASSES[themeColor].cardBorder}`}>
                  <span className="inline-block h-3 w-3 rounded-full mr-2" style={{ backgroundColor: COLOR_HEX[themeColor]['500'] }} />
                  <span className="capitalize">{themeColor}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="max-h-72 overflow-auto">
                {THEME_COLORS.map((c) => (
                  <DropdownMenuItem key={c} onSelect={() => persistThemeColor(c)}>
                    <span className="inline-block h-3 w-3 rounded-full mr-2" style={{ backgroundColor: COLOR_HEX[c]['500'] }} />
                    <span className="capitalize">{c}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className={`h-8 border ${PRESET_CLASSES[themeColor].cardBorder}`}>
                  <span className="mr-2">{locale.toUpperCase()}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {(['en', 'es'] as const).map((lng) => (
                  <DropdownMenuItem
                    key={lng}
                    onSelect={() => {
                      setLocale(lng)
                      saveLocale(lng)
                    }}
                  >
                    {lng.toUpperCase()}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Layout con tabs Listado/Resultados */}
      <div className="px-3 md:px-4 py-6 w-full bg-background/40 rounded-lg mt-4">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'listado' | 'resultados')} className="w-full">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <TabsList className="bg-background/30">
                <TabsTrigger value="listado" className={PRESET_CLASSES[themeColor].tabsTrigger}>{STRINGS[locale].tab_list}</TabsTrigger>
                <TabsTrigger value="resultados" className={PRESET_CLASSES[themeColor].tabsTrigger}>{STRINGS[locale].tab_results}</TabsTrigger>
              </TabsList>
              {playerUrl && (
                <div className="flex items-center gap-2 pl-2">
                  <Button size="icon" variant="ghost" className={`h-8 w-8 p-0 ${PRESET_CLASSES[themeColor].buttonGhost}`} onClick={togglePlayPause} aria-label="Play/Pause">
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <div className="w-40 md:w-56">
                    <Slider
                      value={[duration ? Math.min(currentTime, duration) : 0]}
                      onValueChange={(v) => handleScrub(v[0] ?? 0)}
                      min={0}
                      max={duration || 100}
                      step={0.5}
                      className="[&_[data-slot=slider-range]]:!bg-current"
                      style={{ color: COLOR_HEX[themeColor]['500'] }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground tabular-nums w-28 text-right">
                    {new Date(currentTime * 1000).toISOString().slice(11, 19)} / {new Date((isFinite(duration) ? duration : 0) * 1000).toISOString().slice(11, 19)}
                  </div>
                </div>
              )}
            </div>
            <div className="hidden md:flex items-center gap-3 text-xs">
              <span>{STRINGS[locale].results_per_search}</span>
              <div className="w-40">
                <Slider
                  value={[resultsLimit]}
                  onValueChange={(v) => setResultsLimit(v[0] ?? 10)}
                  min={1}
                  max={20}
                  step={1}
                  className="[&_[data-slot=slider-range]]:!bg-current"
                  style={{ color: COLOR_HEX[themeColor]['500'] }}
                />
              </div>
              <span className="w-6 text-right">{resultsLimit}</span>
            </div>
          </div>
          {/* Hidden audio element for custom player */}
          <audio ref={audioRef} className="hidden" />

          <TabsContent value="listado" className="mt-4">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="tracks" className="mb-4">{STRINGS[locale].tracks_label}</Label>
                <Textarea id="tracks" placeholder="Ej: Artist - Title (Mix)" rows={18} value={rawList} onChange={(e) => setRawList(sanitizeRaw(e.target.value))} className={`${PRESET_CLASSES[themeColor].input} font-mono`} />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  className={PRESET_CLASSES[themeColor].buttonPrimary + ' h-9 w-9 p-0'}
                  size="icon"
                  aria-label={STRINGS[locale].search}
                  disabled={!clientId || queries.length === 0 || isSearching}
                  onClick={handleSearchAll}
                >
                  {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  className={PRESET_CLASSES[themeColor].buttonSecondary + ' h-9 w-9 p-0'}
                  size="icon"
                  aria-label={STRINGS[locale].clear}
                  onClick={() => setRows([])}
                  disabled={rows.length === 0}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="resultados" className="mt-4">
            {isSearching && progressTotal > 0 && (
              <div className="mb-3 space-y-1">
                <div className="h-2 w-full rounded bg-background/30">
                  <div
                    className="h-2 rounded"
                    style={{ width: `${Math.min(100, Math.floor((progressDone / progressTotal) * 100))}%`, backgroundColor: COLOR_HEX[themeColor]['500'] }}
                  />
                </div>
                <div className="text-xs text-muted-foreground">{progressDone}/{progressTotal}</div>
              </div>
            )}
            <div className="overflow-x-hidden">
              <div className="mb-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      className="[&_[data-state=checked]]:!text-white"
                      onCheckedChange={(checked: boolean | "indeterminate") => {
                        // Seleccionar/deseleccionar todos los mejores resultados
                        setSelectedForBulk((prev) => {
                          const next: Record<string, { id: number; title: string; permalink_url: string }> = { ...prev }
                          if (checked === true) {
                            rows.forEach((r) => {
                              if (r.best) next[r.best.permalink_url] = { id: r.best.id, title: r.best.title, permalink_url: r.best.permalink_url }
                            })
                          } else {
                            rows.forEach((r) => {
                              if (r.best) delete next[r.best.permalink_url]
                            })
                          }
                          return next
                        })
                      }}
                      style={{ color: COLOR_HEX[themeColor]['500'] }}
                    />
                    <span>{STRINGS[locale].select_all_main}</span>
                  </div>
                  <div className="opacity-80">
                    {STRINGS[locale].selected_count}: {Object.keys(selectedForBulk).length}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className={PRESET_CLASSES[themeColor].buttonSecondary}
                  onClick={async () => {
                    const urls = Object.values(selectedForBulk).map((t) => t.permalink_url)
                    if (urls.length === 0) return
                    try {
                      setBulkDownloading(true)
                      const res = await fetch(`${API_BASE}/download/batch`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ urls, format: 'mp3' }),
                      })
                      if (!res.ok) return
                      const blob = await res.blob()
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = 'tracks_bundle.zip'
                      document.body.appendChild(a)
                      a.click()
                      a.remove()
                      URL.revokeObjectURL(url)
                    } catch {}
                    finally { setBulkDownloading(false) }
                  }}
                  disabled={Object.keys(selectedForBulk).length === 0 || bulkDownloading}
                >
                  {bulkDownloading ? <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin inline" /> : null}
                  {STRINGS[locale].download_selected}
                </Button>
              </div>
              <Table className="table-fixed w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-6" />
                    <TableHead className="text-left w-[180px]">{STRINGS[locale].column_query}</TableHead>
                    <TableHead className="text-left w-[320px]">{STRINGS[locale].column_best}</TableHead>
                    <TableHead className="text-left w-[80px]">{STRINGS[locale].column_score}</TableHead>
                    <TableHead className="text-left w-[150px]">{STRINGS[locale].column_actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, i) => (
                    <React.Fragment key={`${row.originalQuery}-${i}`}>
                    <TableRow>
                      <TableCell className="w-6 align-top">
                        {row.best && (
                          <Checkbox
                            style={{ color: COLOR_HEX[themeColor]['500'] }}
                            checked={Boolean(selectedForBulk[row.best.permalink_url])}
                            onCheckedChange={(checked: boolean | "indeterminate") => {
                              setSelectedForBulk((prev) => {
                                const next = { ...prev }
                                if (checked === true) {
                                  next[row.best!.permalink_url] = { id: row.best!.id, title: row.best!.title, permalink_url: row.best!.permalink_url }
                                } else {
                                  delete next[row.best!.permalink_url]
                                }
                                return next
                              })
                            }}
                          />
                        )}
                      </TableCell>
                      <TableCell className="w-[180px] max-w-[180px] truncate text-left align-top">{row.originalQuery}</TableCell>
                      <TableCell className="text-left w-[320px] max-w-[320px] align-top">
                        {row.loading ? (
                          <span className="text-muted-foreground">{STRINGS[locale].loading}</span>
                        ) : row.error ? (
                          <span className="text-red-600">{row.error}</span>
                        ) : row.best ? (
                          <div className="flex items-center gap-2 min-w-0">
                            <a href={row.best.permalink_url} target="_blank" rel="noreferrer" className="hover:underline truncate">
                              <span className="truncate inline-block max-w-[260px]">{row.best.title} — {row.best.user?.username}</span>
                            </a>
                            <Badge variant="secondary">{formatMs(row.best.duration)}</Badge>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">{STRINGS[locale].no_results}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-left w-[80px] align-top">
                        {typeof row.bestScore === 'number' && !Number.isNaN(row.bestScore) ? row.bestScore.toFixed(2) : '-'}
                      </TableCell>
                      <TableCell className="space-x-2 text-left w-[150px] whitespace-nowrap align-top">
                        <Button
                          size="icon"
                          variant="outline"
                          className={PRESET_CLASSES[themeColor].buttonSecondary + ' h-8 w-8 p-0'}
                          onClick={() => handleRefreshRow(i)}
                          disabled={row.loading}
                          aria-label={STRINGS[locale].search}
                        >
                          {row.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                        </Button>
                        {row.candidates && row.candidates.length > 0 && (
                          <Button size="icon" variant="secondary" className={PRESET_CLASSES[themeColor].buttonGhost + ' h-8 w-8 p-0'} onClick={() => {
                            setExpandedRows(prev => {
                              const next = new Set(prev)
                              if (next.has(i)) next.delete(i); else next.add(i)
                              return next
                            })
                          }} aria-label={STRINGS[locale].see_more}>
                            {expandedRows.has(i) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        )}
                        {row.best && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className={PRESET_CLASSES[themeColor].buttonGhost}
                            aria-label={STRINGS[locale].download}
                            onClick={async () => {
                              setDownloading(prev => new Set(prev).add(String(row.best!.id)))
                              const url = encodeURIComponent(row.best!.permalink_url)
                              try {
                                const res = await fetch(`${API_BASE}/download?url=${url}&format=mp3`, { method: 'POST' })
                                if (!res.ok) return
                                const blob = await res.blob()
                                const dlUrl = URL.createObjectURL(blob)
                                const a = document.createElement('a')
                                a.href = dlUrl
                                a.download = `${row.best!.title || 'track'}.mp3`
                                document.body.appendChild(a)
                                a.click()
                                a.remove()
                                URL.revokeObjectURL(dlUrl)
                              } finally {
                                setDownloading(prev => { const n = new Set(prev); n.delete(String(row.best!.id)); return n })
                              }
                            }}
                            disabled={downloading.has(String(row.best.id))}
                          >
                            {downloading.has(String(row.best.id)) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                    {expandedRows.has(i) && row.candidates && row.candidates.length > 0 && (
                      <>
                        {row.candidates.map((t) => (
                          <TableRow key={`cand-${i}-${t.id}`} style={{ backgroundColor: hexToRgba(COLOR_HEX[themeColor]['700'], 0.12) }}>
                            <TableCell className="w-6">
                              <Checkbox
                                style={{ color: COLOR_HEX[themeColor]['500'] }}
                                checked={Boolean(selectedForBulk[t.permalink_url])}
                                onCheckedChange={(checked: boolean | "indeterminate") => {
                                  setSelectedForBulk((prev) => {
                                    const next = { ...prev }
                                    if (checked === true) {
                                      next[t.permalink_url] = { id: t.id, title: t.title, permalink_url: t.permalink_url }
                                    } else {
                                      delete next[t.permalink_url]
                                    }
                                    return next
                                  })
                                }}
                              />
                            </TableCell>
                            <TableCell className="pl-2 text-left w-[180px] max-w-[180px] truncate">
                              <div className="truncate">{row.originalQuery}</div>
                            </TableCell>
                            <TableCell className="text-left w-[320px] max-w-[320px]">
                              <div className="flex items-center gap-2 min-w-0">
                                <CornerDownRight className="h-4 w-4 text-muted-foreground" />
                                {t.artwork_url && (
                                  <img src={t.artwork_url} alt="artwork" className="h-4 w-4 rounded-sm object-cover" />
                                )}
                                <a href={t.permalink_url} target="_blank" rel="noreferrer" className="hover:underline truncate">
                                  <span className="truncate inline-block max-w-[260px]">{t.title} — {t.user?.username}</span>
                                </a>
                                <Badge variant="secondary">{formatMs(t.duration)}</Badge>
                              </div>
                            </TableCell>
                            <TableCell className="text-left w-[80px]">{scoreTrackMatch(row.originalQuery, t).toFixed(2)}</TableCell>
                            <TableCell className="text-left space-x-1 w-[150px] whitespace-nowrap">
                              {/* Descargar: si hay purchase_url, usarlo; si es FREE y hay downloads, abrir sección; fallback a permalink */}
                              <a href={(t as any).purchase_url || (t.downloadable && t.has_downloads_left ? t.permalink_url + '#downloads' : t.permalink_url)} target="_blank" rel="noreferrer" className="inline-flex">
                                <Button size="icon" variant="ghost" className={PRESET_CLASSES[themeColor].buttonGhost} aria-label="Open on SoundCloud">
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </a>
                              {((t as any).purchase_url || t.downloadable) && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className={PRESET_CLASSES[themeColor].buttonGhost}
                                  aria-label="Download"
                                  onClick={() => {
                                    const url = (t as any).purchase_url || (t.downloadable ? t.permalink_url + '#downloads' : t.permalink_url)
                                    window.open(url, '_blank')
                                  }}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                size="icon"
                                variant="ghost"
                                className={PRESET_CLASSES[themeColor].buttonGhost}
                                aria-label="Play"
                                onClick={async () => {
                                  // Descargar desde backend y reproducir local (blob)
                                  setDownloading(prev => new Set(prev).add(`play-${t.id}`))
                                  try {
                                    const url = encodeURIComponent(t.permalink_url)
                                    const res = await fetch(`${API_BASE}/download?url=${url}&format=mp3`, { method: 'POST' })
                                    if (!res.ok) return
                                    const blob = await res.blob()
                                    if (playerBlobUrlRef.current) {
                                      URL.revokeObjectURL(playerBlobUrlRef.current)
                                      playerBlobUrlRef.current = null
                                    }
                                    const blobUrl = URL.createObjectURL(blob)
                                    playerBlobUrlRef.current = blobUrl
                                    currentTrackMetaRef.current = { id: t.id, title: t.title, user: t.user?.username }
                                    setPlayerKind('progressive')
                                    setPlayerUrl(blobUrl)
                                  } finally {
                                    setDownloading(prev => { const n = new Set(prev); n.delete(`play-${t.id}`); return n })
                                  }
                                }}
                                disabled={downloading.has(`play-${t.id}`)}
                              >
                                {downloading.has(`play-${t.id}`) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                              </Button>
                              {/* Play button removed per request */}
                              <Button
                                size="icon"
                                variant="ghost"
                                className={PRESET_CLASSES[themeColor].buttonGhost}
                                aria-label={STRINGS[locale].download}
                                onClick={async () => {
                                  setDownloading(prev => new Set(prev).add(String(t.id)))
                                  const url = encodeURIComponent(t.permalink_url)
                                  try {
                                    const res = await fetch(`${API_BASE}/download?url=${url}&format=mp3`, { method: 'POST' })
                                    if (!res.ok) return
                                    const blob = await res.blob()
                                    const dlUrl = URL.createObjectURL(blob)
                                    const a = document.createElement('a')
                                    a.href = dlUrl
                                    a.download = `${t.title || 'track'}.mp3`
                                    document.body.appendChild(a)
                                    a.click()
                                    a.remove()
                                    URL.revokeObjectURL(dlUrl)
                                  } finally {
                                    setDownloading(prev => { const n = new Set(prev); n.delete(String(t.id)); return n })
                                  }
                                }}
                                disabled={downloading.has(String(t.id))}
                              >
                                {downloading.has(String(t.id)) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </>
                    )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      {/* No bottom player - custom bar above handles playback */}
    </div>
  )
}
