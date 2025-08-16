import axios, { type AxiosInstance } from 'axios'

export type SoundCloudTrack = {
  id: number
  title: string
  user: { username: string }
  duration: number
  artwork_url?: string | null
  permalink_url: string
  downloadable?: boolean
  has_downloads_left?: boolean
  download_url?: string | null
}

export type SearchResult = {
  collection: SoundCloudTrack[]
}

// Configura aquí tu client_id único de SoundCloud para toda la app
// Obtén uno inspeccionando requests a api-v2.soundcloud.com en devtools.
// EJEMPLO: export const SOUND_CLOUD_CLIENT_ID = 'abc123...'
export const SOUND_CLOUD_CLIENT_ID: string | null = '3Y3mBjzXGjRmsKq5Ue5vOYy09ZKSRruL'

const API_BASE_URL = import.meta.env.DEV ? '/sc' : 'https://tracklistdownloader-api.dq97zj.easypanel.host/api/sc'

// Opcional: token OAuth fijo (si no es null, se enviará en Authorization)
export const SOUND_CLOUD_OAUTH_TOKEN: string | null = '2-306535-1480175371-5FkiziXo1H3ai'

function getApi(): AxiosInstance {
  const oauth = SOUND_CLOUD_OAUTH_TOKEN
  const instance = axios.create({
    baseURL: API_BASE_URL,
    params: {
      client_id: SOUND_CLOUD_CLIENT_ID ?? undefined,
    },
    headers: oauth ? { Authorization: `OAuth ${oauth}` } : undefined,
  })
  return instance
}

export async function searchTracks(
  query: string,
  limit = 10,
  opts?: { offset?: number; genre?: string; appLocale?: string }
): Promise<SoundCloudTrack[]> {
  if (!SOUND_CLOUD_CLIENT_ID) throw new Error('Falta configurar client_id de SoundCloud en src/lib/soundcloud.ts')
  const api = getApi()
  const params: Record<string, string | number | undefined> = {
    q: query,
    limit,
    offset: opts?.offset,
    app_locale: opts?.appLocale ?? 'en',
  }
  if (opts?.genre) {
    params.facet = 'genre'
    ;(params as any)['filter.genre'] = opts.genre
  }
  const { data } = await api.get<SearchResult>('/search/tracks', { params })
  return (data.collection ?? []).map((t: any) => ({
    id: t.id,
    title: t.title,
    user: { username: t?.user?.username },
    duration: t.duration,
    artwork_url: t.artwork_url,
    permalink_url: t.permalink_url,
    downloadable: t.downloadable,
    has_downloads_left: t.has_downloads_left,
  }))
}

export async function fetchTrackDetails(id: number): Promise<Partial<SoundCloudTrack>> {
  const api = getApi()
  const { data } = await api.get<any>(`/tracks/${id}`)
  return {
    downloadable: data?.downloadable,
    has_downloads_left: data?.has_downloads_left,
    download_url: data?.download_url ?? null,
  }
}

export async function enrichTracksDownloadInfo(tracks: SoundCloudTrack[]): Promise<SoundCloudTrack[]> {
  const needs = tracks.map(async (t) => {
    if (typeof t.downloadable === 'boolean' && typeof t.has_downloads_left === 'boolean') return t
    try {
      const extra = await fetchTrackDetails(t.id)
      return { ...t, ...extra }
    } catch {
      return t
    }
  })
  return Promise.all(needs)
}

export async function resolveStreamUrl(
  id: number,
  prefer: 'hls' | 'progressive' = 'hls'
): Promise<{ url: string | null; kind: 'progressive' | 'hls' | 'unknown' }> {
  const api = getApi()
  if (import.meta.env.DEV) console.debug('[sc] resolveStreamUrl: fetch /tracks', { id, prefer })
  const { data } = await api.get<any>(`/tracks/${id}`)
  const transcodings: any[] = data?.media?.transcodings ?? []
  const trackAuth: string | undefined = data?.track_authorization
  if (import.meta.env.DEV) console.debug('[sc] transcodings', {
    id,
    count: transcodings.length,
    hasTrackAuth: Boolean(trackAuth),
    presets: transcodings.map((t) => ({ preset: t.preset, protocol: t?.format?.protocol, legacy: t.is_legacy_transcoding }))
  })
  // Helper para resolver un transcoding → stream URL
  async function resolveStreamForTranscoding(t: any): Promise<string | null> {
    let target = t.url as string
    // In production, use the full URL directly
    try {
      const u = new URL(t.url)
      if (u.hostname.includes('api-v2.soundcloud.com')) {
        target = import.meta.env.DEV ? `${u.pathname}${u.search}` : `https://tracklistdownloader-api.dq97zj.easypanel.host/api/sc${u.pathname}${u.search}`
      } else if (u.hostname.includes('api.soundcloud.com')) {
        target = import.meta.env.DEV ? `/sc1${u.pathname}${u.search}` : `https://tracklistdownloader-api.dq97zj.easypanel.host/api/sc1${u.pathname}${u.search}`
      }
    } catch {}
    if (import.meta.env.DEV) console.debug('[sc] transcodeTarget', { id, preset: t?.preset, protocol: t?.format?.protocol, target })
    const { data: s } = await api.get<any>(target, {
      params: {
        client_id: SOUND_CLOUD_CLIENT_ID ?? '',
        track_authorization: trackAuth,
      },
    })
    if (import.meta.env.DEV) {
      try {
        const testUrl = s?.url ? new URL(s.url) : null
        console.debug('[sc] stream candidate', {
          id,
          candidateHost: testUrl?.host || null,
          candidatePath: testUrl?.pathname?.slice(0, 64) || null,
        })
      } catch {}
    }
    return s?.url ?? null
  }

  // Construir listas ordenadas
  const hlsList = transcodings
    .filter((t) => String(t.format?.protocol || '').includes('hls'))
    .sort((a, b) => {
      const score = (x: any) => (x.is_legacy_transcoding ? 0 : 2) + (x.preset === 'aac_160k' ? 2 : x.preset === 'abr_sq' ? 1 : 0)
      return score(b) - score(a)
    })
  const progList = transcodings.filter((t) => t.format?.protocol === 'progressive')

  let chosen: any | undefined
  let directUrl: string | null = null

  if (prefer === 'hls') {
    for (const t of hlsList) {
      try {
        const url = await resolveStreamForTranscoding(t)
        if (import.meta.env.DEV) console.debug('[sc] stream resolve result', {
          id,
          preset: t?.preset,
          protocol: t?.format?.protocol,
          urlHost: (() => { try { return url ? new URL(url).host : null } catch { return 'parse_error' } })(),
        })
        if (url && /playback\.media-streaming\.soundcloud\.cloud|media-streaming\.soundcloud/i.test(url)) {
          directUrl = url
          chosen = t
          break
        }
        // Continuar intentando hasta lograr playback.cloud
      } catch (e) {
        if (import.meta.env.DEV) console.debug('[sc] resolve error for transcoding', { id, preset: t?.preset, e })
      }
    }
  }

  if (!directUrl) {
    // Intentar progressive como último recurso
    for (const t of progList) {
      try {
        const url = await resolveStreamForTranscoding(t)
        if (url) {
          directUrl = url
          chosen = t
          break
        }
      } catch {}
    }
  }

  if (!directUrl || !chosen) {
    if (import.meta.env.DEV) console.debug('[sc] no playable stream found', { id })
    return { url: null, kind: 'unknown' }
  }
  // In production, return the direct URL as-is since we only need search functionality
  if (import.meta.env.DEV && directUrl) {
    try {
      const u = new URL(directUrl)
      if (u.hostname.includes('cf-media.sndcdn.com')) {
        directUrl = `/scm${u.pathname}${u.search}`
      } else if (u.hostname.includes('cf-hls-media.sndcdn.com')) {
        directUrl = `/schls${u.pathname}${u.search}`
      } else if (
        u.hostname.includes('playback.media-streaming.soundcloud.cloud') ||
        u.hostname.includes('media-streaming.soundcloud')
      ) {
        directUrl = `/scpb${u.pathname}${u.search}`
      }
      if (import.meta.env.DEV) console.debug('[sc] proxied directUrl', { id, devUrl: directUrl })
    } catch {}
  }
  // Determinar el tipo según el transcoding elegido realmente
  const chosenProtocol = String(chosen?.format?.protocol || '')
  const kind: 'progressive' | 'hls' | 'unknown' = chosenProtocol.includes('hls')
    ? 'hls'
    : chosenProtocol === 'progressive'
    ? 'progressive'
    : 'unknown'
  if (import.meta.env.DEV) console.debug('[sc] resolve done', { id, kind, hasUrl: Boolean(directUrl) })
  return { url: directUrl, kind }
}

export function formatMs(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ') // collapse spaces
    .trim()
}

function toTokenSet(text: string): Set<string> {
  return new Set(normalize(text).split(' '))
}

export function jaccardSimilarity(a: string, b: string): number {
  const setA = toTokenSet(a)
  const setB = toTokenSet(b)
  const intersection = new Set([...setA].filter((x) => setB.has(x)))
  const union = new Set([...setA, ...setB])
  return union.size === 0 ? 0 : intersection.size / union.size
}

export function scoreTrackMatch(query: string, track: SoundCloudTrack): number {
  const composite = `${track.user?.username ?? ''} ${track.title}`
  return jaccardSimilarity(query, composite)
}

export function findBestMatch(query: string, tracks: SoundCloudTrack[]): {
  best: SoundCloudTrack | null
  score: number
} {
  let best: SoundCloudTrack | null = null
  let bestScore = -1
  for (const t of tracks) {
    const score = scoreTrackMatch(query, t)
    if (score > bestScore) {
      best = t
      bestScore = score
    }
  }
  return { best, score: bestScore < 0 ? 0 : bestScore }
}


