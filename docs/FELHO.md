# Fejlesztés a gép nélkül (felhő)

## Mi fut hol

| Rész | Hol fut | Kell-e hozzá a gép? |
|---|---|---|
| A játék | GitHub Pages (az iPad le is tölti, offline is megy) | Nem |
| Szinkron-szerver | Cloudflare (EU) | Nem |
| Élesítés (játék) | GitHub Actions, a `main` ágra kerüléskor magától | Nem |
| Élesítés (szerver) | GitHub Actions, ha a szerver kódja változik (1. lépés után) | Nem |
| Fejlesztés Claude-dal | felhős Claude-munkamenet a claude.ai/code oldalon (2. lépés után) | Nem |

A `C:\dev\szinkorong` mappa a gépen innentől csak egy másolat. Ha később mégis a gépen dolgoznál, előbb frissíteni kell:
`git pull`.

## 1. A szerver automatikus telepítése (egyszer, kb. 5 perc)

Ehhez egy Cloudflare-kulcs kell, amit **te hozol létre, és te teszel be a GitHubba**. Ne küldd el senkinek, chatbe se.

1. https://dash.cloudflare.com → jobb felül a profil ikon → **My Profile** → **API Tokens** → **Create Token**.
2. Az **Edit Cloudflare Workers** sablonnál: **Use template**.
3. A **Permissions** résznél **+ Add more**: `Account` · `D1` · `Edit` (az adatbázis-tábla ellenőrzéséhez).
4. **Account Resources**: `Include` · a saját fiókod. **Zone Resources**: maradhat, ahogy van.
5. **Continue to summary** → **Create Token** → a kulcs mellett **Copy**. (A kulcs csak most látszik egyszer.)
6. https://github.com/bajzatzsolti-cmd/szinkorong → **Settings** → **Secrets and variables** → **Actions** →
   **New repository secret**. Name: `CLOUDFLARE_API_TOKEN`, Secret: a kimásolt kulcs → **Add secret**.
7. Próba: a repóban **Actions** → **Szinkron-szerver telepítése (Cloudflare)** → **Run workflow**. Zöld pipa: kész.
   (Ha piros, a hibaüzenetet másold be a Claude-nak; a kulcsot ne.)

## 2. Felhős Claude-környezet (egyszer)

A feliratok a Claude alkalmazás verziójától függően kicsit eltérhetnek.

1. Nyisd meg a https://claude.ai/code oldalt (telefonon a Claude alkalmazásban a **Code** rész).
2. Kapcsold össze a GitHubbal, ha kéri, és válaszd a `bajzatzsolti-cmd/szinkorong` repót.
3. A környezet (environment) beállításainál:
   - **Hálózat:** a hanggyártáshoz engedélyezni kell az `api.elevenlabs.io` címet (az npm alapból engedélyezett).
   - **Környezeti változó:** `ELEVENLABS_API_KEY` = egy ElevenLabs-kulcs. Javaslat: a gépen lévő helyett csinálj egy újat
     az ElevenLabs oldalán (**Developers** → **API Keys** → **Create**, név: `szinkorong-felho`; elég jog: **Text to Speech**
     és **User: Read**). Így ha valamelyiket le kell tiltani, a másik megmarad. Hanggyártás nélkül ez a lépés kihagyható.

## 3. Munka telefonról

1. A claude.ai/code oldalon indíts új munkamenetet a `szinkorong` repóval, és írd le magyarul, mit szeretnél
   (pl. „A Memóriában legyen 1 másodperccel több nézési idő”).
2. A Claude a repóban lévő `CLAUDE.md` alapján dolgozik: előbb tervet mutat, hangot csak a jóváhagyásod után gyárt,
   és a kész munkát egy külön ágon, **pull requestként** (PR) adja át.
3. **Élesítés = a PR beolvasztása:** GitHub alkalmazás → a repó → **Pull requests** → a PR → **Merge**.
   1–2 perc múlva élő; az iPad a kezdőlapra érve magától átvált az új verzióra.

## Ha valami nem működik

- **Az iPad a régi verziót mutatja:** a frissítés a háttérben töltődik le (kb. 6 MB, a hangok miatt), és a kezdőlapra
  érve vált át. Ha sokáig marad a régi: zárd be teljesen a játékot (alulról felhúzás, a kártyát felfelé el), majd indítsd újra.
  A szülői menü alján látszik a verzió dátuma.
- **A szinkron nem frissít:** a szülői menü **Játékosok** oldalán **Szinkron most**. Internet nélkül a haladás megvárja a hálózatot.
