// Játékosprofilok ezen a készüléken (testvér, vendég). Egy profil lehet „csak ezen a készüléken”, vagy
// szinkronizált (ekkor a szinkron-azonosítója a játékosnév + szülői kód lenyomata; a nevet és a kódot nem tároljuk,
// csak a nevet megjelenítésre, a kódot sehol).
// A régi (profil előtti) haladás az alapprofil („helyi”) tárolókulcsán marad, így frissítéskor semmi nem mozdul el.

const REGISTRY = 'szinkorong:profilok';
export const LOCAL_ID = 'helyi';

export interface ProfileMeta {
  /** Helyi azonosító ('helyi' vagy véletlen). */
  local: string;
  /** Megjelenített név (a szülő írta be). */
  name: string;
  /** Szinkron-azonosító (64 hexa), ha a profil szinkronizált. */
  sync?: string;
  /** Az utolsó sikeres szinkron ideje (ms). */
  lastSync?: number;
  /** Van-e még fel nem töltött változás. */
  pending?: boolean;
}

interface Registry {
  v: 1;
  active: string;
  list: ProfileMeta[];
}

let memory: Registry | null = null;

export const DEFAULT_NAME = 'Első játékos';
const defaults = (): Registry => ({ v: 1, active: LOCAL_ID, list: [{ local: LOCAL_ID, name: DEFAULT_NAME }] });

function load(): Registry {
  if (memory) return memory;
  let r: Registry = defaults();
  try {
    const raw = localStorage.getItem(REGISTRY);
    if (raw) {
      const o = JSON.parse(raw) as Registry;
      if (o && Array.isArray(o.list) && o.list.some((p) => p.local === LOCAL_ID)) r = o;
    }
  } catch {
    // nincs tároló: alapállapot
  }
  if (!r.list.some((p) => p.local === r.active)) r.active = LOCAL_ID;
  memory = r;
  return r;
}

function save(): void {
  try {
    localStorage.setItem(REGISTRY, JSON.stringify(load()));
  } catch {
    // a munkamenet végéig a memóriában marad
  }
}

/** Van-e már bármilyen mentett állapot (az első indítás felismeréséhez). */
export function isFirstLaunch(): boolean {
  try {
    return !localStorage.getItem(REGISTRY) && !localStorage.getItem('szinkorong:v1');
  } catch {
    return false;
  }
}

export const listProfiles = (): readonly ProfileMeta[] => load().list;
export const activeProfile = (): ProfileMeta => load().list.find((p) => p.local === load().active)!;

/** A profil haladásának tárolókulcsa (az alapprofil a régi kulcson). */
export const storeKeyOf = (local: string): string => (local === LOCAL_ID ? 'szinkorong:v1' : `szinkorong:v1:${local}`);
export const activeStoreKey = (): string => storeKeyOf(load().active);

export function switchProfile(local: string): void {
  if (!load().list.some((p) => p.local === local)) return;
  load().active = local;
  save();
}

export function createProfile(name: string, sync?: string): ProfileMeta {
  const local = Math.random().toString(16).slice(2, 10);
  const p: ProfileMeta = { local, name: name.trim(), ...(sync ? { sync, pending: true } : {}) };
  load().list.push(p);
  save();
  return p;
}

export function updateProfile(local: string, patch: Partial<ProfileMeta>): void {
  const p = load().list.find((x) => x.local === local);
  if (!p) return;
  Object.assign(p, patch);
  if (patch.sync === undefined && 'sync' in patch) delete p.sync;
  save();
}

/** Profil eltávolítása a készülékről (a haladásával együtt). Az alapprofilt csak kiüríteni lehet. */
export function removeProfile(local: string): void {
  try {
    localStorage.removeItem(storeKeyOf(local));
  } catch {
    // nincs tároló
  }
  const r = load();
  if (local === LOCAL_ID) {
    const p = r.list.find((x) => x.local === LOCAL_ID)!;
    p.name = DEFAULT_NAME;
    delete p.sync;
    delete p.lastSync;
    delete p.pending;
  } else {
    r.list = r.list.filter((x) => x.local !== local);
  }
  if (r.active === local && local !== LOCAL_ID) r.active = LOCAL_ID;
  save();
}

/** Csak teszteléshez. */
export function _resetProfilesForTests(): void {
  memory = null;
}
