# Színkorong

Telepíthető, offline is futó webapp (PWA) iPad minire: iskolára felkészítő logikai és készségfejlesztő feladatsor
egy 5 éves, még nem olvasó kislánynak, magyar nyelven. Saját családi használatra.

**A játék:** a lap bal oldalán feladatok, mindegyik mellett egy színes (és jellel ellátott) pötty. Jobb oldalon a megoldások,
mindegyik mellett egy üres hely. Alul a korongok: a gyerek a megfelelő pöttyű korongot a megoldás melletti helyre húzza.
A zöld pipa megmutatja a helyes színeket.

## Állapot

**1. sprint kész:** projektváz, PWA, gyerekzár, játékmotor, Sorminta (ideiglenes szabályokkal).
A sprintek listája és a nyitott kérdések a fejlesztési tervben vannak.

## Parancsok

```bash
npm install            # függőségek
npm run dev            # fejlesztői szerver
npm run build          # típusellenőrzés + éles build (dist/)
npm test               # egységtesztek: minden lap generátora és verifikátora
npm run test:e2e       # iPad mini méretű Playwright-tesztek (előbb: npm run build)
npm run check:fonts    # megvan-e az ő/ű a csomagolt betűtípusban
npm run icons          # az ikonok újragyártása (public/icons/icon.svg → PNG)
```

Ha a gépen nincs rendszerszintű Node.js, a projekt hordozható Node-ot is használhat a `.tools/node` mappában:
PowerShellben `. .\scripts\env.ps1` betölti a PATH-ba.

## Dokumentáció

- [docs/TELEPITES.md](docs/TELEPITES.md): GitHub Pages beállítása, kitétel az iPad Főképernyőjére, frissítés
- [docs/GYEREKZAR.md](docs/GYEREKZAR.md): mit old meg a kód, és az iPad Irányított hozzáférés beállítása
- [LICENSES.md](LICENSES.md): harmadik féltől származó elemek

## Felépítés

```
content/            kód nélkül szerkeszthető tartalom (hangszövegek, később: szókincs, párok, mondatok)
src/engine/         motor: véletlen (rng), lap-modell, húzás, pattanás, haladás, hang, gyerekzár
src/render/         SVG-rajzolás: alakzatok, korongok, ikonok, a feladatok „jelenetfája” (Visual)
src/topics/<téma>/  témakörönként: generate.ts (lapok gyártása) + verify.ts (független megoldó)
src/app/            képernyők: kezdőlap, lapválasztó, lap, szülői menü
tests/unit/         egységtesztek
tests/e2e/          Playwright, iPad mini álló és fekvő nézetben
scripts/            ikon-, betűtípus-ellenőrző script
```

## Új témakör hozzáadása

1. `src/topics/<id>/` mappa `generate.ts`-szel és `verify.ts`-szel (lásd `src/topics/minta/`).
2. A témakör felvétele a `src/topics/index.ts` jegyzékébe.
3. A generátor „válasz-első” legyen (előbb a különböző megoldások, aztán a feladatok), a verifikátor pedig a generátortól függetlenül,
   szabály alapján oldja meg a lapot: feladatonként pontosan egy illeszkedő megoldás, lapon belül mind különböző megoldás,
   és ne legyen „kerülőút” (a minta ismerete nélkül is megtalálható válasz).
