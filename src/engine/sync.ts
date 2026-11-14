// Szinkron a készülékek között. Offline az elsődleges: a haladás mindig a készüléken él; a szinkron csak akkor fut,
// ha van net (indításkor, minden változás után kis késleltetéssel, visszakapcsolódáskor, az appba visszatéréskor).
// A hálózaton csak a lenyomat-azonosító és a haladás megy ki; a szerver a két oldal UNIÓJÁT adja vissza.
import { SYNC_URL } from '../config';
import { mergePayload, validatePayload, type SyncPayload } from './merge';
import { activeProfile, updateProfile } from './profiles';
import { exportPayload, importPayload, setProgressListener } from './progress';

export const syncConfigured = (): boolean => SYNC_URL !== '';

const url = (id: string): string => `${SYNC_URL.replace(/\/$/, '')}/v1/p/${id}`;

/** A szerveren tárolt állapot (null = ilyen játékos még nincs). Hiba esetén kivételt dob. */
export async function remoteGet(id: string): Promise<SyncPayload | null> {
  const res = await fetch(url(id), { method: 'GET', cache: 'no-store' });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`szinkron: ${res.status}`);
  const v = validatePayload(((await res.json()) as { payload: unknown }).payload);
  if (!v.ok) throw new Error(`szinkron: hibás válasz (${v.error})`);
  return v.value;
}

/** Feltöltés: a szerver összefésüli a tárolttal, és az eredményt adja vissza. */
export async function remotePut(id: string, payload: SyncPayload): Promise<SyncPayload> {
  const res = await fetch(url(id), { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(`szinkron: ${res.status}`);
  const v = validatePayload(((await res.json()) as { payload: unknown }).payload);
  if (!v.ok) throw new Error(`szinkron: hibás válasz (${v.error})`);
  return v.value;
}

export async function remoteDelete(id: string): Promise<void> {
  const res = await fetch(url(id), { method: 'DELETE' });
  if (!res.ok && res.status !== 404) throw new Error(`szinkron: ${res.status}`);
}

let running: Promise<void> | null = null;
let timer: number | undefined;

/** Az aktív profil szinkronja most (ha szinkronizált és van net). Sosem dob kivételt. */
export function syncNow(): Promise<void> {
  if (running) return running;
  const p = activeProfile();
  if (!syncConfigured() || !p.sync || (typeof navigator !== 'undefined' && navigator.onLine === false)) return Promise.resolve();
  const local = p.local;
  running = (async () => {
    try {
      const sent = exportPayload();
      const merged = await remotePut(p.sync!, sent);
      // Ha közben profilt váltottak, nem írjuk át a másik profilt.
      if (activeProfile().local === local) importPayload(mergePayload(exportPayload(), merged));
      updateProfile(local, { lastSync: Date.now(), pending: false });
    } catch {
      updateProfile(local, { pending: true });
    } finally {
      running = null;
    }
  })();
  return running;
}

/** Változás után kis késleltetéssel (több gyors változás egy feltöltés). */
export function scheduleSync(delayMs = 2500): void {
  if (!activeProfile().sync) return;
  updateProfile(activeProfile().local, { pending: true });
  if (timer !== undefined) window.clearTimeout(timer);
  timer = window.setTimeout(() => void syncNow(), delayMs);
}

/** Az app indításakor: szinkron most, és figyelés (változás, visszakapcsolódás, visszatérés az appba). */
export function setupSync(): void {
  setProgressListener(() => scheduleSync());
  window.addEventListener('online', () => void syncNow());
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void syncNow();
  });
  void syncNow();
}
