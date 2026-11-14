# Játékosprofil és szinkron (SPEC-2, A)

A játékos a szülői menüben (fogaskerék, 3 mp nyomva tartva) → **Játékosok** oldalon kap nevet. Ha a szinkron be van
kapcsolva, egy másik készüléken ugyanazzal a **játékosnévvel és 4 jegyű szülői kóddal** ott folytatja, ahol abbahagyta.
Profil nélkül is lehet játszani: ilyenkor minden csak a készüléken marad.

## Hogyan működik

- **Azonosító:** a készülék a játékosnév (kis- és nagybetű, ékezet, szóköz nélkül) és a kód SHA-256 lenyomatát számolja ki.
  A név és a kód **soha nem megy ki** a hálózatra. A szerver a lenyomatot még egyszer, egy titkos „borssal” (HMAC) is
  lenyomatolja, és csak így tárolja: egy adatbázis-szivárgásból sem fejthetők vissza a nevek.
- **Kitalálható név ellen:** a név önmagában nem elég, a kód is kell, így 10 000 lehetőség van. A szerver kérésszám-korlátja
  (IP-nként percenként 30 kérés) miatt végigpróbálni napokig tartana. Egy gyerek haladási adataihoz ez arányos védelem.
- **Ütközés:** ugyanaz a név más kóddal másik játékos, ezért két család gyakorlatilag nem ütközhet. Ha név + kód már létezik:
  „Ezzel a névvel és kóddal már játszottak. Folytatod?”. Ha nem a tiétek, válassz másik nevet vagy kódot.
- **Összefésülés:**
  - a két oldal kész lapjainak **uniója** marad meg, soha nem felülírás;
  - a szülői beállításokból a frissebb nyer;
  - a „Haladás törlése” időpontja előtti lapok minden készüléken eltűnnek, egy régi készülék sem hozza vissza őket.
- **Offline az elsődleges:** a haladás mindig a készüléken él. A szinkron akkor fut, ha van net: indításkor, minden kész lap
  után, visszakapcsolódáskor, és amikor visszatérsz az appba. Repülő módban játszva a feltöltés később pótlódik.
- **Mit tárol a szerver:** a lenyomatot, a kész lapokat, a szülői beállításokat, a látott bemutatókat és az utolsó módosítás
  idejét. Semmi mást: kérésnapló nincs (`[observability] enabled = false`).
- **Törlés:** Játékosok → „Játékos törlése”. Törli a készülékről és a szerverről is.

## A szerver: Cloudflare Workers + D1 (EU)

| Fájl | Mi |
|---|---|
| `server/src/worker.ts` | az API (GET / PUT / DELETE `/v1/p/<azonosító>`), bemenet-ellenőrzés, 16 KB-os méretkorlát, CORS csak a játék címéről, kérésszám-korlát |
| `server/schema.sql` | egyetlen tábla (`profiles`) |
| `server/wrangler.toml` | beállítások (titok nincs benne) |
| `src/engine/merge.ts` | az összefésülés és az ellenőrzés (a játék és a szerver is ezt használja) |
| `src/config.ts` | a szerver címe (`SYNC_URL`); üres = a szinkron nincs bekapcsolva |

### Állapot (2026-11-14): telepítve

- **Szerver:** `https://szinkorong-sync.szinkorong.workers.dev`. A `workers.dev` aldomain „szinkorong”; a wrangler a
  `server/package.json` „name” mezőjéből képezte.
- **Adatbázis:** D1 `szinkorong`, `eu` jurisdiction (régió: EEUR). Az azonosítója a `server/wrangler.toml`-ban van; ez nem titok.
- **Titok:** a `PEPPER` véletlenszerű, csak a Cloudflare-ben él, sehol nincs leírva. Ha elveszne vagy cserélni kell,
  `npx wrangler secret put PEPPER`, de ezzel minden tárolt profil elérhetetlenné válik: a kulcsuk a régi borsból készült.
- **Élő próba:**
  - idegen és eredet nélküli kérés: 403;
  - nem létező játékos: 404;
  - két mentés összefésül (unió, a frissebb beállítás nyer);
  - hibás bemenet: 400;
  - törlés után: 404, az adatbázis üres.

### Telepítés (egyszer)

**Neked kell:**

1. Ingyenes Cloudflare-fiók: dash.cloudflare.com → Sign up.
2. A wrangler telepítése a projektmappában (PowerShell):
   ```powershell
   cd C:\dev\szinkorong; $env:Path = "C:\dev\szinkorong\.tools\node;" + $env:Path; npm.cmd install --save-dev wrangler
   ```
3. Amikor a `npx wrangler login` megnyitja a böngészőt: **Allow**.

**A többit én futtatom** (a `server` mappában):

```powershell
npx wrangler d1 create szinkorong --jurisdiction eu        # az adatbázis azonosítója a wrangler.toml-ba kerül
npx wrangler d1 execute szinkorong --remote --file schema.sql
npx wrangler secret put PEPPER                              # véletlen titok, csak a Cloudflare-ben él
npx wrangler deploy                                         # → https://szinkorong-sync.<fiók>.workers.dev
```

Végül a kapott cím a `src/config.ts`-be kerül (`SYNC_URL`), és a játék új verziója kimegy.
A kérésszám-korlát (`[[ratelimits]]`) Cloudflare-oldali szolgáltatás. Ha a fiókban nem érhető el, a Worker korlát nélkül is
működik: a kód ellenőrzi.

## Tesztek

- `tests/unit/sync-server.test.ts`: a szerver memóriabeli adatbázissal. Ellenőrzi a CORS-t, az uniót, a törlést,
  a hibás bemenetet és a kérésszám-korlátot.
- `tests/unit/sync-client.test.ts`: a játék és a szerver együtt, két készüléket eljátszva. Ellenőrzi, hogy a lapok mindkét
  irányban megjelennek, hogy a repülő mód utáni feltöltés pótlódik, hogy a hálózaton csak az azonosító és a haladás megy ki,
  és hogy törlés után nem marad adat.
- `tests/e2e/profile.spec.ts`: az első indítás kártyája, a játékosváltás, és hogy beállított szinkron nélkül nincs hálózati forgalom.
