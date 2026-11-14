# Tartalom szerkesztése (kód nélkül)

A Színkorong tartalma szerkeszthető JSON-fájlokban él (`content/`). Szerkesztés után futtasd a tartalom-ellenőrzést, és a tesztek megmondják, ha valami nem stimmel.

| Fájl | Mi van benne |
|---|---|
| `content/szokincs.json` | a központi szókincs: minden szó, kategóriája, képe (emoji), jelzői |
| `content/kategoriak.json` | a kategóriák (állat, gyümölcs…), és hogy a Csoportosító használhatja-e őket |
| `content/parok.json` | a „Mi tartozik össze?” párok és a további összetartozások (`also`) |
| `content/audio/manifest.json` | a felolvasott szövegek (azonosító → magyar szöveg) |

## A szókincs egy szava

```json
{ "id": "kutya", "hu": "kutya", "category": "al", "emoji": "🐕", "goodShadow": true, "similar": "negylaba" }
```

| Mező | Jelentés |
|---|---|
| `id` | ékezet nélküli, kisbetűs azonosító (egyedi) |
| `hu` | a szó magyarul, ékezettel (ebből készül a felolvasás és a hangtani adat) |
| `category` | a `kategoriak.json` egyik azonosítója |
| `emoji` | az OpenMoji-kép emoji-ja (ebből készül az SVG-kép) |
| `goodShadow` | `true`, ha az árnyéka felismerhető (az Árnyékvadász használhatja) |
| `clearName` | `false`, ha a kép neve egy ötévesnek nem egyértelmű (alapértelmezett: igaz) |
| `similar` | hasonló alakú árnyékok csoportja (a nehéz Árnyékvadász lapokon ezek kerülnek egymás mellé) |
| `twin` | szinte egyforma képek csoportja: nem lehetnek egy lapon |
| `flags` | `["[ELLENŐRIZNI] …"]`: a szó nem kerül képes feladatba, amíg a jelzés ott van |
| `note` | szabad megjegyzés |

A kezdőhang, végső hang és szótagszám automatikusan készül (kétjegyű betű = egy hang). Ha egy szónál eltérés kell: `syllables` vagy `phon` felülírható.

## Amit szerkesztés után futtatni kell

```bash
npm run content    # képek (sprite), hang-manifest, jóváhagyási tábla frissítése
npm test           # minden lap, minden szabály ellenőrzése
```

Ha új szót veszel fel: az `emoji` az OpenMoji-ban létezzen (a `npm run sprite` hibát jelez, ha nem).
A `npm test` megmondja, ha egy témakör nem tud elég egyedi lapot készíteni, vagy ha egy új pár nem összeférő.

## Új pár a „Mi tartozik össze?” témakörhöz

Vedd fel a `parok.json` `pairs` listájába: `["kutya", "csont"]`. **Gondold végig:** nincs-e olyan másik szó, amely ugyanúgy hozzá tartozhatna?
Ha van, vedd fel az `also` listába (pl. `["meh", "virag"]`, mert a méh a virághoz is tartozik). Egy lapra csak olyan párok kerülnek, amelyek között nincs semmilyen kapcsolat,
így minden feladathoz pontosan egy megoldás fog illeni.

## Fontos: a szerkesztés megváltoztatja a lapokat

A lapok a tartalomból készülnek (ugyanaz a lap mindig ugyanaz, amíg a tartalom nem változik). Ha a szókincset vagy a párokat átírod,
az egyes sorszámú lapok tartalma megváltozhat, a haladás („kész” jelölések) viszont megmarad. Nyomtatás előtt érdemes a tartalmat lezárni.
