# Licencek

A Színkorong saját rajzolású grafikát (alakzatok, korongok, ikon) és saját kódot tartalmaz.
Az alábbi harmadik féltől származó elemek kerülnek az éles buildbe.

## Betűtípusok (a buildbe csomagolva, offline)

| Betűtípus | Használat | Licenc | Forrás |
|---|---|---|---|
| Nunito | szülői menü szövegei | SIL Open Font License 1.1 | `@fontsource/nunito` (Copyright 2014 The Nunito Project Authors) |
| Fredoka | számok (lapok sorszáma, „?” jel) | SIL Open Font License 1.1 | `@fontsource/fredoka` (Copyright 2016 The Fredoka Project Authors) |

Az OFL 1.1 engedélyezi a szabad használatot, beágyazást és terjesztést (a betűtípus önálló árusítása nélkül).
A licenc teljes szövege a csomagok `LICENSE` fájljában van (`node_modules/@fontsource/*/LICENSE`).
Az ő és ű betűk jelenlétét az `npm run check:fonts` ellenőrzi.

## Képkészlet

A 2. sprintben kerül be (javaslat: OpenMoji, CC BY-SA 4.0). A pontos licenc ellenőrzése és az
előírt forrásmegjelölés akkor ide kerül.

## Fejlesztői eszközök

A Vite, TypeScript, Vitest, Playwright és társaik csak a fejlesztéshez kellenek, a kész appba nem kerülnek bele.
