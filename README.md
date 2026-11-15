# Színkorong

Telepíthető, offline is futó webapp (PWA) iPad minire: iskolára felkészítő logikai és készségfejlesztő feladatsor
egy 5 éves, még nem olvasó kislánynak, magyar nyelven. Saját családi használatra.

**A játék:** a lap bal oldalán feladatok, mindegyik mellett egy színes (és jellel ellátott) pötty. Jobb oldalon a megoldások,
mindegyik mellett egy üres hely. Alul a korongok: a gyerek a megfelelő pöttyű korongot a megoldás melletti helyre húzza.
A zöld pipa megmutatja a helyes színeket.

## Állapot

**1. sprint kész:** projektváz, PWA, gyerekzár, játékmotor.
**2. sprint (képkészlet és szókincs):** OpenMoji SVG-képkészlet, központi szókincs, négy témakör
(Árnyékvadász, Sorminta, Mi tartozik össze?, Csoportosító), 15–15 lap szinten. A szókincs és a párok jóváhagyásra várnak:
[docs/SZOKINCS-JOVAHAGYAS.md](docs/SZOKINCS-JOVAHAGYAS.md).
**3a sprint (vizuális és logikai témakörök, első fele):** Betűkereső, Tükör és forgatás, Mátrix, Analógia, valamint az animált,
szöveg nélküli bemutató a Mátrix és az Analógia első lapja előtt.
**3b sprint (logikai témakörök, második fele):** Kakukktojás, Képes sudoku (bemutatóval), Mérleg, Fél kép, Kódfejtő.
A Mérleg könnyű szintje súlyosztályokat használ (`content/suly.json`, tervezet); a képek színét, irányát és féloldalasságát
a gép méri (`npm run image-props`, `content/kepjellemzok.json`), a szókincsben felülírható.
**4a sprint (hang, első fele):** Hangoló plusz (kezdőhang, végső hang, szótagszám; feladatonként saját hanggal),
ElevenLabs-hanggyártás (`npm run hang`, Aggie hangja), saját felvétel bármelyik klip helyett, Hangpróba a szülői menüben.
**4b sprint (hang, második fele):** Hol van? (saját rajzú, szemből nézett jelenetek), Ha–akkor (érvényes
következtetések, ütköző képek kizárva), rímek a Hangoló plusz 3. szintjén; minden szöveg Aggie hangján (339 klip, 4,8 MB).
A kézi tartalom: [docs/TERVEZET-4B.md](docs/TERVEZET-4B.md) (jóváhagyva).
**5a sprint:** Számoló plusz (ugyanannyi, több, eggyel több/kevesebb, számszomszédok, összeadás/elvétel 10-ig;
szétszórt képekkel), Memória (saját, nem korongos képernyő: melyik volt, melyik volt itt, milyen sorrendben),
a nyitott app automatikus frissítésének javítása. Mind a 18 témakör kész.
**5b sprint:** nyomtatás a szülői menüből (számítógépről, A4: laponként egy oldal üres körökkel, jelmagyarázattal,
megoldókulccsal a végén vagy minden lap után; fekete-fehérben is használható; a hallás utáni témakörök és a Memória
kimaradnak), Névjegy oldal (licencek, adatvédelem).
**Profil-sprint (SPEC-2, A):** játékosok egy készüléken (váltás a szülői menüben), szinkron más készülékkel játékosnév +
4 jegyű szülői kód alapján (csak a lenyomat megy ki, a kész lapok uniója marad meg), Cloudflare Workers + D1 (EU) szerver:
[docs/PROFIL.md](docs/PROFIL.md). Élesben.
**Felhő:** a szerver a GitHubról is települ (`.github/workflows/server.yml`), a fejlesztés felhős Claude-munkamenetben
is mehet, a fejlesztői gép nélkül: [docs/FELHO.md](docs/FELHO.md). A kezdőlap csempéi mindig kiférnek (Safari címsorával is).
A Betűkeresőben bármelyik betűre koppintva elhangzik a neve („Pé betű.”).
A szintek szabályai ideiglenesek, a generátorok fejlécében olvashatók.
Élő változat: <https://bajzatzsolti-cmd.github.io/szinkorong/> (a `main` ág minden push után kikerül).

## Parancsok

```bash
npm install            # függőségek
npm run dev            # fejlesztői szerver
npm run build          # típusellenőrzés + éles build (dist/)
npm test               # egységtesztek: minden lap generátora és verifikátora
npm run test:e2e       # iPad mini méretű Playwright-tesztek (előbb: npm run build)
npm run check:fonts    # megvan-e az ő/ű a csomagolt betűtípusban
npm run icons          # az ikonok újragyártása (public/icons/icon.svg → PNG)
npm run content        # szókincs-változás után: képek (sprite), hang-manifest, jóváhagyási tábla
npm run hang:fiok      # ElevenLabs: kulcs, kreditegyenleg, hangok (nem fogyaszt kreditet)
npm run hang:becsles   # mit gyártana a hangscript és mennyibe kerülne
npm run hang           # hangfájlok gyártása (rákérdez; részletek: docs/HANGOK.md)
npm run tervezet:report  # a 4b tervezetek jóváhagyási táblázata (docs/TERVEZET-4B.md)
```

Ha a gépen nincs rendszerszintű Node.js, a projekt hordozható Node-ot is használhat a `.tools/node` mappában:
PowerShellben `. .\scripts\env.ps1` betölti a PATH-ba.

## Dokumentáció

- [docs/TELEPITES.md](docs/TELEPITES.md): GitHub Pages beállítása, kitétel az iPad Főképernyőjére, frissítés
- [docs/GYEREKZAR.md](docs/GYEREKZAR.md): mit old meg a kód, és az iPad Irányított hozzáférés beállítása
- [docs/TARTALOM-SZERKESZTES.md](docs/TARTALOM-SZERKESZTES.md): a szókincs, a párok és a hangszövegek szerkesztése kód nélkül
- [docs/SZOKINCS-JOVAHAGYAS.md](docs/SZOKINCS-JOVAHAGYAS.md): minden szó, besorolás és pár jóváhagyásra (generált)
- [docs/HANGOK.md](docs/HANGOK.md): hanggyártás (ElevenLabs), API-kulcs, rossz klipek javítása, saját felvétel, betűhangok, licenc
- [docs/TERVEZET-4B.md](docs/TERVEZET-4B.md): Hol van?, Ha–akkor, rímpárok tervezete jóváhagyásra (generált)
- [docs/FELHO.md](docs/FELHO.md): fejlesztés és élesítés a gép nélkül (Cloudflare-kulcs, felhős Claude, PR-ből élesítés)
- [SPEC-2-profil-hang.md](SPEC-2-profil-hang.md): kiegészítő specifikáció (játékosprofil, ElevenLabs-hangok)
- [LICENSES.md](LICENSES.md): harmadik féltől származó elemek (OpenMoji CC BY-SA 4.0, betűtípusok OFL)

## Felépítés

```
content/            kód nélkül szerkeszthető tartalom: szókincs, kategóriák, párok, súlyosztályok, hangszövegek, mért képjellemzők
src/engine/         motor: véletlen (rng), lap-modell, húzás, pattanás, haladás, hang, gyerekzár
src/render/         SVG-rajzolás: alakzatok, korongok, ikonok, a feladatok „jelenetfája” (Visual)
src/topics/<téma>/  témakörönként: generate.ts (lapok gyártása) + verify.ts (független megoldó)
src/app/            képernyők: kezdőlap, lapválasztó, lap, szülői menü
tests/unit/         egységtesztek
tests/e2e/          Playwright, iPad mini álló és fekvő nézetben
scripts/            ikon-, sprite-, manifest-, betűtípus-ellenőrző script; play-server.mjs: naplózó kiszolgáló a helyi hálózati kipróbáláshoz
```

## Új témakör hozzáadása

1. `src/topics/<id>/` mappa `generate.ts`-szel és `verify.ts`-szel (lásd `src/topics/minta/`).
2. A témakör felvétele a `src/topics/index.ts` jegyzékébe.
3. A generátor „válasz-első” legyen (előbb a különböző megoldások, aztán a feladatok), a verifikátor pedig a generátortól függetlenül,
   szabály alapján oldja meg a lapot: feladatonként pontosan egy illeszkedő megoldás, lapon belül mind különböző megoldás,
   és ne legyen „kerülőút” (a minta ismerete nélkül is megtalálható válasz).
