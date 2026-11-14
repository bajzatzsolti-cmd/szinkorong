# Hangok: gyártás, javítás, saját felvétel

A játék minden felolvasása **előre legyártott hangfájl**, a játék futás közben nem hív külső szolgáltatást.
Ha egy fájl hiányzik, a készülék saját magyar hangja olvas fel (gépi tartalék), így a játék sosem áll meg.

## A választott hang és beállítás

- **Hang:** Aggie (ElevenLabs Hanggyűjtemény, magyar női mesélőhang). Lárus választotta 2026-11-14-én, két próbakör után.
- **Beállítások:** `content/audio/hang-beallitas.json`: a hang azonosítója, a modell, a stabilitás és a hasonlóság, valamint az egyszavas módszer.
  Ha itt bármi változik, a script **minden** klipet újragyárt, mert a beállítás is része a lenyomatnak.
- **Szövegek:** `content/audio/manifest.json` (azonosító → magyar szöveg). A `szo-*` bejegyzések a szókincsből jönnek (`npm run manifest`).

## Mennyibe kerül (mért adatok, Aggie hangjával)

| Modell | Magyarul | Kredit / karakter |
|---|---|---|
| eleven_v3 | igen | 0,40 |
| eleven_v4 | igen | 0,40 |
| eleven_flash_v2_5 | igen | 0,20 |
| eleven_multilingual_v2 | **nem** | – |

A teljes anyag kb. 10–12 ezer karakter, vagyis v3 vagy v4 modellel kb. 4–5 ezer kredit.

## API-kulcs (egyszer kell beállítani)

1. Az elevenlabs.io-n a bal alsó profilmenüben: **API Keys** → **Create API Key**, név: `szinkorong-hang`.
2. **Restrict key:** a **Text to Speech** legyen engedélyezve. A **Voices: Read** és a **User: Read** jog a hanglistához és az egyenleg
   kiírásához kell. A „Voices: Write” jog nem kell.
3. **Credit limit:** például 20 000.
4. A kulcsot tedd a projekt gyökerében lévő **`.env.local`** fájlba: `ELEVENLABS_API_KEY=...`
   - Ez a fájl **nem kerül a repóba** (`.gitignore`), és a játékba sem kerülhet bele.
   - A kulcsot soha ne másold be chatbe vagy más fájlba.

## Gyártás

```powershell
. .\scripts\env.ps1          # hordozható Node a PATH-ba
npm run hang:fiok            # kulcs, kreditegyenleg, hangok (nem fogyaszt kreditet)
npm run hang:becsles         # mit gyártana és mennyibe kerülne (nem fogyaszt kreditet)
npm run hang                 # gyártás: előtte kiírja a becslést és rákérdez
npm run hang -- --csak szo-alma,szo-tyuk   # csak néhány klip (pl. próbakör), semmit nem töröl
```

**Mit csinál a script** (`scripts/hang-generalas.mjs`):

- **Fájlnév:** egy szöveg = egy fájl, a neve a szöveg lenyomata: `src/assets/audio/<lenyomat>.mp3`.
  Ugyanazt a mondatot akárhány azonosító használja, csak egyszer készül el.
- **Csak a változást gyártja:**
  - a `src/assets/audio/_lenyomatok.json` napló őrzi minden klip szövegét, beállítás-lenyomatát és a generálás dátumát;
  - ami megvan és nem változott, kimarad;
  - amire már semmi nem hivatkozik, törlődik.
- **Utómunka:** a nyers, 24 kHz-es hang elejéről és végéről levágja a csendet, egységes hangerőre hozza
  (-20 dB átlag, -1 dB csúcs), majd kis mono MP3-ba kódolja (48 kbit/s).
- **Biztonsági korlát:** ha a becslés több a `--max-kredit` értéknél (alapból 9000), meg sem kezdi.
- **Költség:** a végén kiírja a felhasznált kreditet és a hangcsomag méretét. A `npm run build` is kiírja a hangcsomag méretét.

## Egyszavas klipek (képnevek)

A puszta szónál a gépi hang néha furcsán hangsúlyoz, sóhajt vagy hosszan elnyújtja (a próbán Aggie „gyűrű” klipje 2,2 mp lett).
Három módszert próbáltunk ki:

| Módszer | Mit kér a script | Tapasztalat |
|---|---|---|
| `puszta` | „alma” | néha furcsa, elnyújtott |
| `pont` | „Alma.” | természetes, rövid (ez az alapértelmezett) |
| `keret` | „Ez egy alma.”, majd a szót a betűnkénti időzítés alapján kivágja | a legtermészetesebb hangsúly, kb. kétszer annyi karakter |

A rossznak jelölt egyszavas klipeket a script `keret` módszerrel gyártja újra.

## Rossz klipek javítása (Hangpróba)

1. A szülői menüben (fogaskerék, 3 mp nyomás): **Hangpróba**.
   Minden szöveg látszik, mellette, hogy kész hangfájl, saját felvétel vagy gépi tartalék szól-e.
2. Hallgasd meg, és a rosszakat jelöld meg (**rossz**). A jelölés ezen a készüléken megmarad.
3. **Lista másolása**: a megjelölt azonosítók a vágólapra kerülnek. Küldd el, vagy tedd be a `content/audio/rossz.json` fájl
   `azonositok` listájába.
4. `npm run hang`: a megjelölteket a `hang-beallitas.json` „rossz_klipek” beállításával (más stabilitás, keretmondat) gyártja újra.

## Saját felvétel (bármelyik klip helyett)

A `content/audio/sajat/` mappába tett `<azonosító>.mp3` vagy `.m4a` fájl **minden gépi hangnál előbbre való**.
Az iPhone Diktafon `.m4a`-t ment, az is jó. Részletek: `content/audio/sajat/OLVASSEL.md`.

### Betűhangok (hangoztatva, nem betűnévvel)

A gépi hang ezeket gyakran rosszul ejti (betűnevet mond: „em”, nem „mmm”). A játék jelenleg **nem** játszik le önálló betűhangot:
a Hangoló plusz egész szavakat hasonlít össze. A lista a későbbi betűs játékhoz kell. Ha felveszed őket, ezek a fájlnevek:

| Hang | Fájlnév | Hang | Fájlnév | Hang | Fájlnév |
|---|---|---|---|---|---|
| a | `hang-a` | gy | `hang-gy` | ny | `hang-ny` |
| á | `hang-aa` | h | `hang-h` | o | `hang-o` |
| b | `hang-b` | i | `hang-i` | ó | `hang-oo` |
| c | `hang-c` | í | `hang-ii` | ö | `hang-oe` |
| cs | `hang-cs` | j (ly) | `hang-j` | ő | `hang-ooe` |
| d | `hang-d` | k | `hang-k` | p | `hang-p` |
| dz | `hang-dz` | l | `hang-l` | r | `hang-r` |
| dzs | `hang-dzs` | m | `hang-m` | s | `hang-s` |
| e | `hang-e` | n | `hang-n` | sz | `hang-sz` |
| é | `hang-ee` | t | `hang-t` | ty | `hang-ty` |
| f | `hang-f` | u | `hang-u` | ú | `hang-uu` |
| g | `hang-g` | ü | `hang-ue` | ű | `hang-uue` |
| v | `hang-v` | z | `hang-z` | zs | `hang-zs` |

*Tipp: a folyamatos hangokat (m, n, l, sz, s, f, v, z, zs, j, r, h és a magánhangzók) fél másodpercig nyújtsd („mmm”).
A pattanó hangokat (b, p, d, t, g, k, gy, ty, c, cs) röviden, magánhangzó nélkül ejtsd, amennyire lehet.*

## Licenc

- **Az ElevenLabs súgója szerint:** „Once your subscription ends, you will still have a commercial license to use whatever you generated
  during that subscription forever.” Az előfizetés alatt generált hangok tehát a lemondás után is használhatók, nyilvános, ingyenes
  játékban is.
- **[ELLENŐRIZNI]** A szolgáltatás-specifikus feltételek (Service-Specific Terms) részleteit, és azt, hogy a Hanggyűjtemény hangjaira
  (Aggie) a hang tulajdonosa szabott-e külön feltételt.
- A generálás dátumát a `_lenyomatok.json` klipenként rögzíti: ez igazolja, hogy a klip az előfizetés ideje alatt készült.
- **A keret vége:** a Starter csomag kreditkerete 2026-12-14-én indul újra. Ha az előfizetést lemondod, minden hangnak addig el kell készülnie.
