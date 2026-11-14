# Licencek

A Színkorong saját rajzolású grafikát (alakzatok, korongok, ikon) és saját kódot tartalmaz.
Az alábbi harmadik féltől származó elemek kerülnek az éles buildbe.

## Képkészlet: OpenMoji (CC BY-SA 4.0)

> All emojis designed by [OpenMoji](https://openmoji.org/) – the open-source emoji and icon project.
> License: [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/#)

| | |
|---|---|
| Forrás | az `openmoji` npm-csomag 17.0.0-s kiadása (https://github.com/hfg-gmuend/openmoji) |
| Licenc | Creative Commons Attribution-ShareAlike 4.0 (CC BY-SA 4.0), a grafikákra; a csomag kódja LGPL-3.0, de a build ezt nem tartalmazza |
| Mit használunk | a szókincs szavaihoz tartozó színes SVG-rajzok (`color/svg`), kb. 185 db |
| Módosítás | a rajzok egyetlen SVG-sprite-ba kerülnek (`src/assets/sprite/openmoji.svg`); az azonosítók előtagolva (ütközés elkerülésére); az „árnyék” változatok egyszínű sziluettek, amelyeket a rajzokból gyártunk (`scripts/build-sprite.mjs`) |
| Hol látszik a forrásmegjelölés | a szülői menü alján (kicsi szöveg), valamint ebben a fájlban és a sprite fájl fejlécében |

**Share-alike:** az OpenMoji-rajzokból készült módosított változat (a sprite, benne az árnyékok) a CC BY-SA 4.0 licenc alatt áll;
a megjelölést és a licenc-hivatkozást meg kell tartani. A Színkorong saját kódját ez nem érinti (külön fájlokban él).
A teljes licencszöveg a csomagban: `node_modules/openmoji/LICENSE.txt`.

## Betűtípusok (a buildbe csomagolva, offline)

| Betűtípus | Használat | Licenc | Forrás |
|---|---|---|---|
| Nunito | szülői menü szövegei | SIL Open Font License 1.1 | `@fontsource/nunito` (Copyright 2014 The Nunito Project Authors) |
| Fredoka | számok (lapok sorszáma, „?” jel) | SIL Open Font License 1.1 | `@fontsource/fredoka` (Copyright 2016 The Fredoka Project Authors) |

Az OFL 1.1 engedélyezi a szabad használatot, beágyazást és terjesztést (a betűtípus önálló árusítása nélkül).
A licenc teljes szövege a csomagok `LICENSE` fájljában van (`node_modules/@fontsource/*/LICENSE`).
Az ő és ű betűk jelenlétét az `npm run check:fonts` ellenőrzi.

## Fejlesztői eszközök

A Vite, TypeScript, Vitest, Playwright és társaik csak a fejlesztéshez kellenek, a kész appba nem kerülnek bele.
