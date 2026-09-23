import type { IndexEntry, National, SchoolRecord } from "./types";

const BASE = `${import.meta.env.BASE_URL}data`;

const caches = {
  index: null as Promise<IndexEntry[]> | null,
  national: null as Promise<National> | null,
  states: new Map<string, Promise<SchoolRecord[]>>(),
};

async function get<T>(url: string): Promise<T> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Failed to load ${url} (${r.status})`);
  return (await r.json()) as T;
}

/** ~26k-entry search index; loaded lazily on first keystroke. */
export function getIndex(): Promise<IndexEntry[]> {
  if (!caches.index) caches.index = get<IndexEntry[]>(`${BASE}/index.json`);
  return caches.index;
}

export function getNational(): Promise<National> {
  if (!caches.national)
    caches.national = get<National>(`${BASE}/national.json`);
  return caches.national;
}

export function getState(code: string): Promise<SchoolRecord[]> {
  const key = code.toUpperCase();
  let p = caches.states.get(key);
  if (!p) {
    p = get<SchoolRecord[]>(`${BASE}/states/${key}.json`);
    caches.states.set(key, p);
  }
  return p;
}

export async function getSchool(key: string): Promise<SchoolRecord | null> {
  const index = await getIndex();
  const hit = index.find((e) => e.k === key);
  if (!hit) return null;
  const schools = await getState(hit.s);
  return schools.find((r) => r.k === key) ?? null;
}
