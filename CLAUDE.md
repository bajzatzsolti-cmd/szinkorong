# Színkorong – útmutató Claude-nak

Offline PWA iPad minire: színkorongos logikai és iskolára hangoló játék egy 5 éves, még nem olvasó gyereknek.
Élő játék: https://bajzatzsolti-cmd.github.io/szinkorong/ · Szinkron-szerver: https://szinkorong-sync.szinkorong.workers.dev
Részletek: `README.md` (felépítés, sprintek), `docs/` (tartalom, hangok, profil, felhő).

## Munkamód (a szülő kérése)

- **Magyarul** kommunikálj. Kódazonosító lehet angol, a komment magyar.
- Új specifikációnál **előbb terv**, kód csak jóváhagyás után. Munka sprintenként.
- Sprint végén: mi készült, hogyan próbálható ki, mi maradt nyitva.
- **Pedagógiai szabályt ne találj ki**: tegyél javaslatot, a bizonytalan adatot jelöld `[ELLENŐRIZNI]`-vel.
  Kézzel írt tartalom (mondatok, párok, szólista) előbb tervezetként kerül jóváhagyásra (`docs/TERVEZET-*.md`).
- Döntési pontokon rövid kérdés, ajánlott opcióval. A szülő gyakran telefonról válaszol: legyél tömör.

## Élesítés

- A `main` ág **maga az élő játék**: pushra a `.github/workflows/deploy.yml` épít, tesztel és kitelepít (GitHub Pages).
  A szerver kódjának változásakor a `.github/workflows/server.yml` a Cloudflare-re is telepít.
- `main`-re csak a szülő kifejezett igenje után kerülhet bármi. Munkaágon dolgozz (pl. `sprint-6-ipad`), és nyiss PR-t;
  a beolvasztás (= élesítés) a szülő döntése.
- Commit szerzője mindig: `Színkorong fejlesztő <szinkorong@example.invalid>`. Valódi név vagy e-mail ne kerüljön a repóba.

## Titkok és adatvédelem

- **ElevenLabs-kulcs:** az `ELEVENLABS_API_KEY` környezeti változóból (felhős munkamenetben a környezet beállításaiból)
  vagy a gitignore-olt `.env.local`-ból jön. Soha ne kérd el a chatben, soha ne írd ki, és soha ne írd repóba kerülő fájlba.
- **PEPPER** (a szerver titkos „borsa”): csak a Cloudflare-ben él. Ne cseréld: minden tárolt profil elérhetetlenné válna.
- **CLOUDFLARE_API_TOKEN:** csak GitHub-titokként létezik, a `server.yml` használja.
- A szinkron nem tárol személyes adatot: a hálózatra csak a név + kód lenyomata és a haladás megy (`docs/PROFIL.md`).

## Hang (ElevenLabs) – kreditszabály

- Hang: Aggie, `eleven_v3`, egyszavas „pont” módszer. Beállítások: `content/audio/hang-beallitas.json`, leírás: `docs/HANGOK.md`.
- **Minden generálás előtt** kérdezd le az egyenleget (`npm run hang:fiok`), írd ki a becslést (`npm run hang:becsles`),
  és **várd meg a szülő jóváhagyását**. Csak utána: `npm run hang -- --yes --max-kredit <keret>`.
- A szülő által rossznak jelölt klipek: `content/audio/rossz.json`. Saját felvétel felülírja a generáltat: `content/audio/sajat/`.
- Az előfizetés kerete 2026-12-14-én fordul; a kreditkereteket a `SPEC-2-profil-hang.md` rögzíti.

## Parancsok

Windows-gépen (a szülőé) előbb: `. .\scripts\env.ps1` (hordozható Node a `.tools/` mappában). Felhőben/Linuxon a rendszer Node-ja (22+).

```bash
npm ci                 # függőségek (felhős munkamenet elején először ezt)
npm run build          # típusellenőrzés + éles build (dist/)
npm test               # egységtesztek (Vitest): generátorok, verifikátorok, hang, szinkron
npm run test:e2e       # Playwright WebKit, iPad mini álló + fekvő; előbb build. Felhőben: npx playwright install --with-deps webkit
npm run content        # tartalomváltozás után: sprite, képtulajdonságok, hang-manifest, szókincs-riport
npm run manifest       # ha változik egy kimondott szöveg: frissíti a content/audio/manifest.json-t
```

Élesítés előtt: `npm run build`, `npm test` és `npm run test:e2e` legyen zöld.
