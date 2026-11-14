// Játékosnév + szülői kód → azonosító. A név és a kód SOHA nem megy ki a hálózatra: a készülék a
// lenyomatukat (SHA-256) küldi, a szerver ezt még egyszer, titkos „borssal” lenyomatolja tárolás előtt.
// Kis- és nagybetű, ékezet, szóköz nem számít: „Laruska 22” = „laruska22” = „LÁRUSKA22”.

/** A név összehasonlítható alakja: ékezet nélkül, kisbetűvel, csak betű és számjegy. */
export function normalizeName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

/** A játékosnév szabálya (SPEC-2): 3–20 karakter, betű és legalább 2 számjegy. Hiba esetén a szülőnek szóló szöveg. */
export function nameProblem(name: string): string | null {
  const t = name.trim();
  if (t.length < 3 || t.length > 20) return 'A játékosnév 3–20 karakter legyen.';
  const n = normalizeName(t);
  if (!/[a-z]/.test(n)) return 'Legyen benne betű is.';
  if ((n.match(/\d/g) ?? []).length < 2) return 'Legyen benne legalább 2 számjegy (pl. Laruska22).';
  return null;
}

export const codeProblem = (code: string): string | null => (/^\d{4}$/.test(code) ? null : 'A szülői kód 4 számjegy legyen.');

/** A szinkron-azonosító: SHA-256(„szinkorong:v1:” + név + „:” + kód), 64 hexa jegy. */
export async function profileId(name: string, code: string): Promise<string> {
  const data = new TextEncoder().encode(`szinkorong:v1:${normalizeName(name)}:${code}`);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
