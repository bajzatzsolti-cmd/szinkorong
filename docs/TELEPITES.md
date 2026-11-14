# Telepítés: GitHub Pages és az iPad Főképernyője

A Színkorong egyetlen statikus build (`dist/`), szerver nem kell hozzá. A GitHub Pages ingyen kiteszi,
az iPad pedig appként a Főképernyőre teszi, és a legelső betöltés után **repülő módban is fut**.

## 1. A repó létrehozása a GitHubon

1. Jelentkezz be a GitHubra (vagy készíts ingyenes fiókot), majd **New repository**.
2. Név: `szinkorong`. Láthatóság: **Public**.
   > Ingyenes GitHub-fiókkal a GitHub Pages csak publikus repóból működik, vagyis a kód, a képek és
   > (később) a hangfájlok is nyilvánosak lesznek. Ha ez nem elfogadható, lásd a 7. pontot (Cloudflare Pages).
3. Ne pipáld be a README / .gitignore / licenc létrehozását (a projekt már tartalmaz ilyet).

## 2. A kód feltöltése

A projektmappában (`C:\dev\szinkorong`) a `main` ág már létezik, és a legutóbbi kész, tesztelt sprint állapotát tartalmazza. Csak fel kell tölteni:

```bash
git remote add origin https://github.com/<felhasznalonev>/szinkorong.git
```

```bash
git push -u origin main
```

(A `<felhasznalonev>` helyére a saját GitHub-felhasználóneved kerül. Az első feltöltéskor a Git böngészőablakban kéri a GitHub-bejelentkezést.)

A fejlesztés sprintenként külön ágon folyik (`sprint-…`); egy sprint akkor kerül a `main` ágra, amikor kész és a tesztek zöldek.

## 3. A GitHub Pages bekapcsolása (egyszer)

1. A repóban: **Settings → Pages**.
2. **Build and deployment → Source:** válaszd a **GitHub Actions** lehetőséget.
3. Nincs több teendő: a `.github/workflows/deploy.yml` workflow minden `main`-re pusholáskor buildel, teszteket futtat, és kiteszi az oldalt.

## 4. Az első kitelepítés

1. A repó **Actions** fülén megjelenik a „Build és kitelepítés” futás. Várd meg a zöld pipát (1–2 perc).
2. Az oldal címe: `https://<felhasznalonev>.github.io/szinkorong/` (a **Settings → Pages** is megmutatja).
3. Ha a futás piros: nyisd meg, és nézd meg, melyik lépés bukott el (betűtípus-ellenőrzés, build vagy teszt).

## 5. Az iPad Főképernyőjére tétel

1. Az iPaden nyisd meg a **Safari**ban a fenti címet (internet kell hozzá).
2. Koppints a **Megosztás** gombra (négyzet felfelé mutató nyíllal), majd **Főképernyőhöz adás**, végül **Hozzáadás**.
3. Zárd be a Safarit, és **a Főképernyőn lévő Színkorong ikonról** indítsd az appot (teljes képernyőn, böngészősáv nélkül nyílik).
4. Az első indításkor legyen internet, és várj 10–20 másodpercet: ilyenkor tölti le a teljes appot az offline használathoz.
5. **Offline próba:** kapcsold be a repülő módot, zárd be az appot (csúsztatás felfelé), indítsd újra. Ha a kezdőlap megjelenik és egy lap játszható, minden rendben.

> Fontos: a Safari-fülben és a Főképernyőre tett appban a **haladás külön tárolódik**. A játékot mindig a Főképernyő-ikonról használd.

## 6. Új verzió feltöltése

1. Módosítás után: `git add . && git commit -m "..." && git push` a `main` ágra.
2. A workflow újra lefut, és kiteszi az új verziót.
3. Az iPad az app **következő indításakor vagy előtérbe kerülésekor** észleli az új verziót, háttérben letölti (csak a megváltozott fájlokat), és **a kezdőlapon vagy a lapválasztón váltja át** magát, soha nem lap közben.
4. A haladás megmarad (a tárolt adatot a frissítés nem érinti).
5. Ha ellenőrizni akarod, melyik verzió fut: szülői menü (jobb sarok, 3 mp nyomás) → alul a verzió és a build időpontja.

Ha az új verzió nem jelenik meg: zárd be az appot (csúsztatás felfelé), nyisd meg újra, és várj egy percet a kezdőlapon.
**Ne töröld a Safari webhelyadatait**, mert azzal a haladás is elvész.

## 7. Alternatíva: Cloudflare Pages (privát repóval is ingyenes)

Ha a repónak privátnak kell maradnia: Cloudflare Pages, a repó összekötésével. Build parancs: `npm run build`, kimeneti mappa: `dist`.
Az app relatív útvonalakat használ, ezért ugyanaz a build működik. A beállítás részletes leírását kérésre elkészítem.

## 8. Gyors kipróbálás a helyi hálózaton (telepítés nélkül)

Ha a gép és az iPad ugyanazon a Wi-Fi-n van, a játék a gépről is megnyitható az iPad Safarijában:
`http://<a gép IP-címe>:5180` (a szerver a `.play` mappában lévő kész buildet szolgálja ki).

Korlátok: csak akkor megy, amíg a gép be van kapcsolva és a szerver fut; **nincs offline mód** (a service worker csak HTTPS-en működik);
a haladás ehhez a címhez kötődik, a későbbi GitHub Pages-címre nem megy át. Ha az iPad nem éri el a címet, a Windows tűzfala blokkolja:
a megjelenő „Windows biztonság” ablakban engedélyezni kell a Node.js-t (céges gépen ehhez rendszergazdai jog kellhet).

## 9. Helyi fejlesztés

Szükséges: Node.js 22 vagy újabb.

```bash
npm install
npm run dev        # fejlesztői szerver (hálózaton az iPadről is megnyitható)
npm run check      # típusellenőrzés + build + egységtesztek
npm run build && npm run test:e2e   # iPad mini méretű Playwright-tesztek (álló és fekvő)
```

A service worker (offline mód) csak `localhost`-on vagy HTTPS-en működik, ezért az offline próbát a kitelepített
(GitHub Pages) verzióval érdemes végezni.
