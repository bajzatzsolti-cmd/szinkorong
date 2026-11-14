// A szinkron-szerver címe (Cloudflare Worker, lásd docs/PROFIL.md). Nem titok: a játék innen kéri le és ide menti a
// haladást. Üres = a szinkron nincs beállítva (a profilok ekkor is működnek, csak ezen a készüléken).
export const SYNC_URL: string = 'https://szinkorong-sync.szinkorong.workers.dev';
