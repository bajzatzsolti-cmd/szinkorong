# Szókincs és párok: jóváhagyásra

*Generálta: `npm run vocab:report` (scripts/vocab-report.mjs). Kézzel ne szerkeszd: a forrás a `content/szokincs.json`, `content/kategoriak.json` és `content/parok.json`.*

A szókincs a Színkorong központi szótára: minden képes feladat (árnyék, párok, csoportok, minták, később a hangtani feladatok is) ebből dolgozik.
**Kérlek, nézd át a besorolásokat, a jelzőket és a megjegyzéseket.** Ahol eltérést kérsz, elég megírnod a szót és a javítást.

## Összesítés

- 185 szó, 20 kategória, 101 szó jó árnyékú, 31 szónak nem egyértelmű a neve egy ötévesnek.
- 41 pár és 20 további összetartozás („also”) a „Mi tartozik össze?” témakörhöz.
- A képek az OpenMoji készletéből valók (CC BY-SA 4.0, lásd LICENSES.md).
- **Még üres, szándékosan:** a rímcsoport (a Hangoló plusz 4. sprintben, a rímpárokkal együtt) és a jelzők (tags: szín, élőhely stb.; a Kakukktojással a 3. sprintben).
- A kezdő- és végső hang, valamint a szótagszám a magyar névből automatikusan készül (kétjegyű betű = egy hang: cs, sz, zs, gy, ny, ty, ly, dz, dzs; a kettőzött hosszú mássalhangzó két hang). A bizonytalan esetek [ELLENŐRIZNI] jelzést kapnak.

## Amit külön kérek, hogy ellenőrizz (11)

- 🦉 **bagoly** (`bagoly`): [ELLENŐRIZNI] az „ly” hangja j: kezdő/végső hangnál ne használjuk
- 🕷️ **pók** (`pok`): [ELLENŐRIZNI] a pók nem rovar, de a gyerekek a bogarak közé sorolják
- 🦗 **tücsök** (`tucsok`): [ELLENŐRIZNI] ismeri-e a gyerek a tücsköt
- 🍅 **paradicsom** (`paradicsom`): [ELLENŐRIZNI] a paradicsom zöldség, de piros és kerek, mint az alma: a gyerek gyümölcsnek nézheti (Csoportosító)
- 🥐 **kifli** (`kifli`): [ELLENŐRIZNI] a kép croissant: kiflinek ismeri-e fel a gyerek
- 🚗 **autó** (`auto`): [ELLENŐRIZNI] szótagszám: az „au/eu” egy vagy két szótag? (autó: au-tó = 2?)
- 🚒 **tűzoltóautó** (`tuzoltoauto`): [ELLENŐRIZNI] szótagszám: az „au/eu” egy vagy két szótag? (autó: au-tó = 2?)
- 🚓 **rendőrautó** (`rendorauto`): [ELLENŐRIZNI] szótagszám: az „au/eu” egy vagy két szótag? (autó: au-tó = 2?)
- 🪐 **bolygó** (`bolygo`): [ELLENŐRIZNI] ismeri-e a gyerek a bolygót (gyűrűs bolygó a képen)
- 🍄 **gomba** (`gomba`): [ELLENŐRIZNI] a prototípusban zöldség volt; a gomba nem zöldség és nem növény, ezért az „egyéb” kategóriába tettem; a kép piros pöttyös gomba
- ❄️ **hópehely** (`hopehely`): [ELLENŐRIZNI] az „ly” hangja j: kezdő/végső hangnál ne használjuk

## A nem egyértelmű nevű szavak (31)

*A kép neve nem biztos, hogy egyértelmű egy ötévesnek. Az ilyen szavakat a Hangoló plusz (kezdőhang, végső hang, rím, szótagszám) NEM használja, a többi témakör igen.*

- 🐖 **malac**: a képen disznó is lehet
- 🐄 **tehén**: tehén vagy tőgyes tehén / marha
- 🐓 **kakas**: kakas vagy tyúk
- 🦢 **hattyú**: hattyú vagy liba
- 🦋 **lepke**: lepke vagy pillangó
- 🐞 **katica**: katica vagy katicabogár
- 🥞 **palacsinta**: palacsinta vagy amerikai palacsinta
- 🍲 **leves**: leves vagy főzelék, étel a fazékban
- ⛵ **hajó**: hajó vagy vitorlás
- 🛴 **roller**
- 🏍️ **motor**: motor vagy motorbicikli
- 👕 **póló**: póló vagy ing
- 👗 **ruha**: ruha vagy szoknya
- 🪁 **sárkány**: papírsárkány (nem a mesebeli sárkány)
- 🎲 **kocka**: dobókocka
- 🔧 **csavarkulcs**
- 🌷 **virág**: tulipán
- 👀 **szem**: két szem
- 💡 **lámpa**: villanykörte
- ⏰ **óra**: ébresztőóra
- ☎️ **telefon**: régi, tárcsás telefon
- 🧶 **gombolyag**: gombolyag, fonal
- 🛋️ **kanapé**: kanapé és lámpa
- 🎨 **festék**: festékpaletta
- 📄 **papír**: papírlap
- 🍴 **villa**: a képen villa és kés is van
- 🥅 **kapu**: focikapu
- ⛽ **benzinkút**: kút / töltőpisztoly
- 🌊 **víz**: hullám, víz
- 😴 **alvás**: alvó arc
- 👶 **baba**: baba (csecsemő)

## Kategóriák

| Azonosító | Név | Család | Csoportosítható (Csoportosító) | Szavak száma |
|---|---|---|---|---|
| `al` | állat | allat | igen | 27 |
| `ma` | madár | allat | igen | 10 |
| `bo` | bogár | allat | igen | 7 |
| `gy` | gyümölcs | gy | igen | 12 |
| `zo` | zöldség | zo | igen | 8 |
| `et` | étel, ital | et | igen | 10 |
| `ed` | édesség | ed | igen | 7 |
| `ja` | jármű | ja | igen | 14 |
| `ru` | ruha | ru | igen | 11 |
| `ha` | hangszer | ha | igen | 6 |
| `eg` | az égen, az űrben | eg | igen | 6 |
| `jt` | játék | jt | igen | 5 |
| `sz` | szerszám | sz | igen | 4 |
| `no` | növény | no | igen | 5 |
| `te` | testrész | te | igen | 5 |
| `hz` | háztartási tárgy | hz | – | 17 |
| `bu` | bútor | bu | – | 3 |
| `is` | iskolai, rajzoló eszköz | is | – | 7 |
| `ko` | evőeszköz | ko | – | 2 |
| `eb` | egyéb | eb | – | 19 |

*Család: ugyanabba a családba tartozó kategóriák nem szerepelhetnek egy lapon (a madár és a bogár is állat).*

## A szavak kategóriánként

Oszlopok: kép, név, azonosító, **kezdőhang**, **végső hang**, **szótagszám**, **jó árnyék** (felismerhető az árnyéka), **egyértelmű név**, csoportok (hasonló alakú árnyékok / iker-képek), megjegyzés.

### állat (`al`, 27 szó)

| Kép | Név | Azonosító | Kezdő | Végső | Szótag | Árnyék | Egyért. név | Csoport | Megjegyzés |
|---|---|---|---|---|---|---|---|---|---|
| 🐕 | **kutya** | `kutya` | k | a | 2 | igen | igen | hasonló: negylaba |  |
| 🐈 | **cica** | `cica` | c | a | 2 | igen | igen | hasonló: negylaba |  |
| 🐁 | **egér** | `eger` | e | r | 2 | igen | igen | hasonló: negylaba |  |
| 🐇 | **nyuszi** | `nyuszi` | ny | i | 2 | igen | igen | hasonló: negylaba |  |
| 🦊 | **róka** | `roka` | r | a | 2 | – | igen |  |  |
| 🐻 | **medve** | `medve` | m | e | 2 | – | igen |  |  |
| 🐖 | **malac** | `malac` | m | c | 2 | igen | **nem** | hasonló: negylaba | a képen disznó is lehet |
| 🐄 | **tehén** | `tehen` | t | n | 2 | igen | **nem** | hasonló: negylaba | tehén vagy tőgyes tehén / marha |
| 🐸 | **béka** | `beka` | b | a | 2 | – | igen |  |  |
| 🐒 | **majom** | `majom` | m | m | 2 | igen | igen |  |  |
| 🐎 | **ló** | `lo` | l | ó | 1 | igen | igen | hasonló: negylaba, iker: paripa | az árnyéka a zebráéhoz nagyon hasonló |
| 🐑 | **bárány** | `barany` | b | ny | 2 | igen | igen | hasonló: negylaba |  |
| 🐐 | **kecske** | `kecske` | k | e | 2 | igen | igen | hasonló: negylaba |  |
| 🦌 | **szarvas** | `szarvas` | sz | s | 2 | igen | igen | hasonló: negylaba |  |
| 🐪 | **teve** | `teve` | t | e | 2 | igen | igen | hasonló: negylaba |  |
| 🐊 | **krokodil** | `krokodil` | k | l | 3 | igen | igen | hasonló: kuszo |  |
| 🐘 | **elefánt** | `elefant` | e | t | 3 | igen | igen | hasonló: nagy |  |
| 🦒 | **zsiráf** | `zsiraf` | zs | f | 2 | igen | igen | hasonló: nagy |  |
| 🦁 | **oroszlán** | `oroszlan` | o | n | 3 | – | igen |  |  |
| 🦓 | **zebra** | `zebra` | z | a | 2 | igen | igen | hasonló: negylaba, iker: paripa | az árnyéka a lóéhoz nagyon hasonló |
| 🐢 | **teknős** | `teknos` | t | s | 2 | igen | igen | hasonló: kuszo |  |
| 🐍 | **kígyó** | `kigyo` | k | ó | 2 | igen | igen | hasonló: kuszo |  |
| 🐟 | **hal** | `hal` | h | l | 1 | igen | igen | hasonló: vizi |  |
| 🐬 | **delfin** | `delfin` | d | n | 2 | igen | igen | hasonló: vizi |  |
| 🦔 | **süni** | `suni` | s | i | 2 | igen | igen |  |  |
| 🐿️ | **mókus** | `mokus` | m | s | 2 | igen | igen |  |  |
| 🐌 | **csiga** | `csiga` | cs | a | 2 | igen | igen | hasonló: kuszo |  |

### madár (`ma`, 10 szó)

| Kép | Név | Azonosító | Kezdő | Végső | Szótag | Árnyék | Egyért. név | Csoport | Megjegyzés |
|---|---|---|---|---|---|---|---|---|---|
| 🐓 | **kakas** | `kakas` | k | s | 2 | igen | **nem** | hasonló: madar | kakas vagy tyúk |
| 🐔 | **tyúk** | `tyuk` | ty | k | 1 | – | igen |  |  |
| 🦆 | **kacsa** | `kacsa` | k | a | 2 | igen | igen | hasonló: madar |  |
| 🦉 | **bagoly** | `bagoly` | b | ly | 2 | igen | igen | hasonló: madar | [ELLENŐRIZNI] az „ly” hangja j: kezdő/végső hangnál ne használjuk |
| 🐧 | **pingvin** | `pingvin` | p | n | 2 | igen | igen | hasonló: madar |  |
| 🦢 | **hattyú** | `hattyu` | h | ú | 2 | igen | **nem** | hasonló: madar | hattyú vagy liba |
| 🐥 | **csibe** | `csibe` | cs | e | 2 | – | igen |  |  |
| 🕊️ | **galamb** | `galamb` | g | b | 2 | igen | igen | hasonló: madar |  |
| 🦜 | **papagáj** | `papagaj` | p | j | 3 | igen | igen | hasonló: madar |  |
| 🐦 | **madár** | `madar` | m | r | 2 | – | igen |  | általános madár: a Csoportosítóban csak a „madár” csoportot jelöli |

### bogár (`bo`, 7 szó)

| Kép | Név | Azonosító | Kezdő | Végső | Szótag | Árnyék | Egyért. név | Csoport | Megjegyzés |
|---|---|---|---|---|---|---|---|---|---|
| 🐝 | **méh** | `meh` | m | h | 1 | – | igen |  |  |
| 🦋 | **lepke** | `lepke` | l | e | 2 | igen | **nem** |  | lepke vagy pillangó |
| 🐞 | **katica** | `katica` | k | a | 3 | – | **nem** |  | katica vagy katicabogár |
| 🐜 | **hangya** | `hangya` | h | a | 2 | igen | igen | hasonló: rovar |  |
| 🕷️ | **pók** | `pok` | p | k | 1 | igen | igen | hasonló: rovar | [ELLENŐRIZNI] a pók nem rovar, de a gyerekek a bogarak közé sorolják |
| 🐛 | **hernyó** | `hernyo` | h | ó | 2 | – | igen |  |  |
| 🦗 | **tücsök** | `tucsok` | t | k | 2 | – | igen |  | [ELLENŐRIZNI] ismeri-e a gyerek a tücsköt |

### gyümölcs (`gy`, 12 szó)

| Kép | Név | Azonosító | Kezdő | Végső | Szótag | Árnyék | Egyért. név | Csoport | Megjegyzés |
|---|---|---|---|---|---|---|---|---|---|
| 🍎 | **alma** | `alma` | a | a | 2 | igen | igen | hasonló: gyumolcs |  |
| 🍐 | **körte** | `korte` | k | e | 2 | igen | igen | hasonló: gyumolcs |  |
| 🍌 | **banán** | `banan` | b | n | 2 | igen | igen | hasonló: gyumolcs |  |
| 🍓 | **eper** | `eper` | e | r | 2 | igen | igen | hasonló: gyumolcs |  |
| 🍒 | **cseresznye** | `cseresznye` | cs | e | 3 | igen | igen | hasonló: gyumolcs |  |
| 🍇 | **szőlő** | `szolo` | sz | ő | 2 | igen | igen | hasonló: gyumolcs |  |
| 🍉 | **dinnye** | `dinnye` | d | e | 2 | – | igen |  |  |
| 🍋 | **citrom** | `citrom` | c | m | 2 | – | igen |  |  |
| 🍊 | **narancs** | `narancs` | n | cs | 2 | – | igen |  |  |
| 🍑 | **barack** | `barack` | b | k | 2 | – | igen |  |  |
| 🍍 | **ananász** | `ananasz` | a | sz | 3 | igen | igen | hasonló: gyumolcs |  |
| 🥝 | **kivi** | `kivi` | k | i | 2 | – | igen |  |  |

### zöldség (`zo`, 8 szó)

| Kép | Név | Azonosító | Kezdő | Végső | Szótag | Árnyék | Egyért. név | Csoport | Megjegyzés |
|---|---|---|---|---|---|---|---|---|---|
| 🥕 | **répa** | `repa` | r | a | 2 | igen | igen |  |  |
| 🍅 | **paradicsom** | `paradicsom` | p | m | 4 | – | igen |  | [ELLENŐRIZNI] a paradicsom zöldség, de piros és kerek, mint az alma: a gyerek gyümölcsnek nézheti (Csoportosító) |
| 🥒 | **uborka** | `uborka` | u | a | 3 | – | igen |  |  |
| 🌽 | **kukorica** | `kukorica` | k | a | 4 | – | igen |  |  |
| 🥔 | **krumpli** | `krumpli` | k | i | 2 | – | igen |  |  |
| 🧅 | **hagyma** | `hagyma` | h | a | 2 | – | igen |  |  |
| 🥦 | **brokkoli** | `brokkoli` | b | i | 3 | igen | igen |  |  |
| 🫑 | **paprika** | `paprika` | p | a | 3 | – | igen |  |  |

### étel, ital (`et`, 10 szó)

| Kép | Név | Azonosító | Kezdő | Végső | Szótag | Árnyék | Egyért. név | Csoport | Megjegyzés |
|---|---|---|---|---|---|---|---|---|---|
| 🍞 | **kenyér** | `kenyer` | k | r | 2 | – | igen |  |  |
| 🧀 | **sajt** | `sajt` | s | t | 1 | – | igen |  |  |
| 🥚 | **tojás** | `tojas` | t | s | 2 | – | igen |  |  |
| 🥛 | **tej** | `tej` | t | j | 1 | – | igen |  |  |
| 🍯 | **méz** | `mez` | m | z | 1 | – | igen |  |  |
| 🥐 | **kifli** | `kifli` | k | i | 2 | igen | igen |  | [ELLENŐRIZNI] a kép croissant: kiflinek ismeri-e fel a gyerek |
| 🍕 | **pizza** | `pizza` | p | a | 2 | – | igen |  |  |
| 🥞 | **palacsinta** | `palacsinta` | p | a | 4 | – | **nem** |  | palacsinta vagy amerikai palacsinta |
| 🧈 | **vaj** | `vaj` | v | j | 1 | – | igen |  |  |
| 🍲 | **leves** | `leves` | l | s | 2 | – | **nem** |  | leves vagy főzelék, étel a fazékban |

### édesség (`ed`, 7 szó)

| Kép | Név | Azonosító | Kezdő | Végső | Szótag | Árnyék | Egyért. név | Csoport | Megjegyzés |
|---|---|---|---|---|---|---|---|---|---|
| 🍰 | **torta** | `torta` | t | a | 2 | – | igen |  |  |
| 🍦 | **fagyi** | `fagyi` | f | i | 2 | igen | igen |  |  |
| 🍭 | **nyalóka** | `nyaloka` | ny | a | 3 | igen | igen |  |  |
| 🍫 | **csoki** | `csoki` | cs | i | 2 | – | igen |  |  |
| 🍪 | **keksz** | `keksz` | k | sz | 1 | – | igen |  |  |
| 🍬 | **cukorka** | `cukorka` | c | a | 3 | igen | igen |  |  |
| 🍩 | **fánk** | `fank` | f | k | 1 | igen | igen |  |  |

### jármű (`ja`, 14 szó)

| Kép | Név | Azonosító | Kezdő | Végső | Szótag | Árnyék | Egyért. név | Csoport | Megjegyzés |
|---|---|---|---|---|---|---|---|---|---|
| 🚗 | **autó** | `auto` | a | ó | 3 | igen | igen | iker: auto | [ELLENŐRIZNI] szótagszám: az „au/eu” egy vagy két szótag? (autó: au-tó = 2?) |
| 🚌 | **busz** | `busz` | b | sz | 1 | igen | igen | hasonló: kerekes |  |
| 🚂 | **vonat** | `vonat` | v | t | 2 | igen | igen | hasonló: kerekes |  |
| ✈️ | **repülő** | `repulo` | r | ő | 3 | igen | igen | hasonló: leg |  |
| 🚁 | **helikopter** | `helikopter` | h | r | 4 | igen | igen | hasonló: leg |  |
| 🚲 | **bicikli** | `bicikli` | b | i | 3 | igen | igen | hasonló: ketkerekes |  |
| ⛵ | **hajó** | `hajo` | h | ó | 2 | igen | **nem** |  | hajó vagy vitorlás |
| 🚀 | **rakéta** | `raketa` | r | a | 3 | igen | igen | hasonló: leg |  |
| 🚜 | **traktor** | `traktor` | t | r | 2 | igen | igen | hasonló: kerekes |  |
| 🛴 | **roller** | `roller` | r | r | 2 | igen | **nem** | hasonló: ketkerekes |  |
| 🏍️ | **motor** | `motor` | m | r | 2 | – | **nem** | hasonló: ketkerekes | motor vagy motorbicikli |
| 🚒 | **tűzoltóautó** | `tuzoltoauto` | t | ó | 6 | igen | igen | iker: auto | [ELLENŐRIZNI] szótagszám: az „au/eu” egy vagy két szótag? (autó: au-tó = 2?) |
| 🚑 | **mentő** | `mento` | m | ő | 2 | igen | igen | iker: auto |  |
| 🚓 | **rendőrautó** | `rendorauto` | r | ó | 5 | igen | igen | iker: auto | [ELLENŐRIZNI] szótagszám: az „au/eu” egy vagy két szótag? (autó: au-tó = 2?) |

### ruha (`ru`, 11 szó)

| Kép | Név | Azonosító | Kezdő | Végső | Szótag | Árnyék | Egyért. név | Csoport | Megjegyzés |
|---|---|---|---|---|---|---|---|---|---|
| 👕 | **póló** | `polo` | p | ó | 2 | igen | **nem** | hasonló: felsoruha | póló vagy ing |
| 👖 | **nadrág** | `nadrag` | n | g | 2 | igen | igen |  |  |
| 👗 | **ruha** | `ruha` | r | a | 2 | igen | **nem** | hasonló: felsoruha | ruha vagy szoknya |
| 🧦 | **zokni** | `zokni` | z | i | 2 | igen | igen | hasonló: lablab |  |
| 🧤 | **kesztyű** | `kesztyu` | k | ű | 2 | igen | igen |  |  |
| 🧣 | **sál** | `sal` | s | l | 1 | – | igen |  |  |
| 👟 | **cipő** | `cipo` | c | ő | 2 | igen | igen | hasonló: lablab |  |
| 🧢 | **sapka** | `sapka` | s | a | 2 | igen | igen |  |  |
| 👢 | **csizma** | `csizma` | cs | a | 2 | igen | igen | hasonló: lablab |  |
| 🧥 | **kabát** | `kabat` | k | t | 2 | – | igen | hasonló: felsoruha |  |
| 👒 | **kalap** | `kalap` | k | p | 2 | igen | igen |  |  |

### hangszer (`ha`, 6 szó)

| Kép | Név | Azonosító | Kezdő | Végső | Szótag | Árnyék | Egyért. név | Csoport | Megjegyzés |
|---|---|---|---|---|---|---|---|---|---|
| 🎸 | **gitár** | `gitar` | g | r | 2 | igen | igen | hasonló: hur |  |
| 🎹 | **zongora** | `zongora` | z | a | 3 | – | igen |  |  |
| 🥁 | **dob** | `dob` | d | b | 1 | igen | igen |  |  |
| 🎺 | **trombita** | `trombita` | t | a | 3 | igen | igen | hasonló: fuvos |  |
| 🎻 | **hegedű** | `hegedu` | h | ű | 3 | igen | igen | hasonló: hur |  |
| 🎷 | **szaxofon** | `szaxofon` | sz | n | 3 | igen | igen | hasonló: fuvos |  |

### az égen, az űrben (`eg`, 6 szó)

| Kép | Név | Azonosító | Kezdő | Végső | Szótag | Árnyék | Egyért. név | Csoport | Megjegyzés |
|---|---|---|---|---|---|---|---|---|---|
| ☀️ | **nap** | `nap` | n | p | 1 | – | igen |  |  |
| 🌙 | **hold** | `hold` | h | d | 1 | igen | igen |  |  |
| ⭐ | **csillag** | `csillag` | cs | g | 2 | igen | igen |  |  |
| ☁️ | **felhő** | `felho` | f | ő | 2 | igen | igen |  |  |
| 🌈 | **szivárvány** | `szivarvany` | sz | ny | 3 | – | igen |  |  |
| 🪐 | **bolygó** | `bolygo` | b | ó | 2 | – | igen |  | [ELLENŐRIZNI] ismeri-e a gyerek a bolygót (gyűrűs bolygó a képen) |

### játék (`jt`, 5 szó)

| Kép | Név | Azonosító | Kezdő | Végső | Szótag | Árnyék | Egyért. név | Csoport | Megjegyzés |
|---|---|---|---|---|---|---|---|---|---|
| 🧸 | **maci** | `maci` | m | i | 2 | igen | igen |  |  |
| ⚽ | **labda** | `labda` | l | a | 2 | – | igen |  |  |
| 🎈 | **lufi** | `lufi` | l | i | 2 | igen | igen |  |  |
| 🪁 | **sárkány** | `sarkany` | s | ny | 2 | igen | **nem** |  | papírsárkány (nem a mesebeli sárkány) |
| 🎲 | **kocka** | `kocka` | k | a | 2 | – | **nem** |  | dobókocka |

### szerszám (`sz`, 4 szó)

| Kép | Név | Azonosító | Kezdő | Végső | Szótag | Árnyék | Egyért. név | Csoport | Megjegyzés |
|---|---|---|---|---|---|---|---|---|---|
| 🔨 | **kalapács** | `kalapacs` | k | cs | 3 | igen | igen | hasonló: szerszam |  |
| 🪚 | **fűrész** | `furesz` | f | sz | 2 | igen | igen | hasonló: szerszam |  |
| 🔧 | **csavarkulcs** | `csavarkulcs` | cs | cs | 3 | igen | **nem** | hasonló: szerszam |  |
| 🪛 | **csavarhúzó** | `csavarhuzo` | cs | ó | 4 | – | igen |  |  |

### növény (`no`, 5 szó)

| Kép | Név | Azonosító | Kezdő | Végső | Szótag | Árnyék | Egyért. név | Csoport | Megjegyzés |
|---|---|---|---|---|---|---|---|---|---|
| 🌳 | **fa** | `fa` | f | a | 1 | igen | igen |  |  |
| 🌷 | **virág** | `virag` | v | g | 2 | – | **nem** |  | tulipán |
| 🌻 | **napraforgó** | `napraforgo` | n | ó | 4 | – | igen |  |  |
| 🌵 | **kaktusz** | `kaktusz` | k | sz | 2 | igen | igen |  |  |
| 🌲 | **fenyő** | `fenyo` | f | ő | 2 | igen | igen |  |  |

### testrész (`te`, 5 szó)

| Kép | Név | Azonosító | Kezdő | Végső | Szótag | Árnyék | Egyért. név | Csoport | Megjegyzés |
|---|---|---|---|---|---|---|---|---|---|
| 🦶 | **láb** | `lab` | l | b | 1 | – | igen |  |  |
| ✋ | **kéz** | `kez` | k | z | 1 | – | igen |  |  |
| 👂 | **fül** | `ful` | f | l | 1 | – | igen |  |  |
| 🦷 | **fog** | `fog` | f | g | 1 | – | igen |  |  |
| 👀 | **szem** | `szem` | sz | m | 1 | – | **nem** |  | két szem |

### háztartási tárgy (`hz`, 17 szó)

| Kép | Név | Azonosító | Kezdő | Végső | Szótag | Árnyék | Egyért. név | Csoport | Megjegyzés |
|---|---|---|---|---|---|---|---|---|---|
| 🪜 | **létra** | `letra` | l | a | 2 | igen | igen |  |  |
| 🧹 | **seprű** | `sepru` | s | ű | 2 | igen | igen |  |  |
| 🪣 | **vödör** | `vodor` | v | r | 2 | igen | igen |  |  |
| 🔑 | **kulcs** | `kulcs` | k | cs | 1 | igen | igen |  |  |
| 💡 | **lámpa** | `lampa` | l | a | 2 | igen | **nem** |  | villanykörte |
| ⏰ | **óra** | `ora` | ó | a | 2 | – | **nem** |  | ébresztőóra |
| 🚪 | **ajtó** | `ajto` | a | ó | 2 | – | igen |  |  |
| ☂️ | **esernyő** | `esernyo` | e | ő | 3 | igen | igen |  |  |
| 🎁 | **ajándék** | `ajandek` | a | k | 3 | igen | igen |  |  |
| ☎️ | **telefon** | `telefon` | t | n | 3 | – | **nem** |  | régi, tárcsás telefon |
| 🪥 | **fogkefe** | `fogkefe` | f | e | 3 | – | igen |  |  |
| 🍼 | **cumisüveg** | `cumisuveg` | c | g | 4 | – | igen |  |  |
| 🕯️ | **gyertya** | `gyertya` | gy | a | 2 | – | igen |  |  |
| ✉️ | **levél** | `level` | l | l | 2 | – | igen |  |  |
| 📮 | **postaláda** | `postalada` | p | a | 4 | – | igen |  |  |
| 🎧 | **fejhallgató** | `fejhallgato` | f | ó | 4 | – | igen |  |  |
| 🧶 | **gombolyag** | `gombolyag` | g | g | 3 | – | **nem** |  | gombolyag, fonal |

### bútor (`bu`, 3 szó)

| Kép | Név | Azonosító | Kezdő | Végső | Szótag | Árnyék | Egyért. név | Csoport | Megjegyzés |
|---|---|---|---|---|---|---|---|---|---|
| 🪑 | **szék** | `szek` | sz | k | 1 | igen | igen |  |  |
| 🛏️ | **ágy** | `agy` | á | gy | 1 | – | igen |  |  |
| 🛋️ | **kanapé** | `kanape` | k | é | 3 | – | **nem** |  | kanapé és lámpa |

### iskolai, rajzoló eszköz (`is`, 7 szó)

| Kép | Név | Azonosító | Kezdő | Végső | Szótag | Árnyék | Egyért. név | Csoport | Megjegyzés |
|---|---|---|---|---|---|---|---|---|---|
| 📚 | **könyv** | `konyv` | k | v | 1 | – | igen |  |  |
| ✂️ | **olló** | `ollo` | o | ó | 2 | igen | igen |  |  |
| ✏️ | **ceruza** | `ceruza` | c | a | 3 | igen | igen |  |  |
| 📓 | **füzet** | `fuzet` | f | t | 2 | – | igen |  |  |
| 🖌️ | **ecset** | `ecset` | e | t | 2 | – | igen |  |  |
| 🎨 | **festék** | `festek` | f | k | 2 | – | **nem** |  | festékpaletta |
| 📄 | **papír** | `papir` | p | r | 2 | – | **nem** |  | papírlap |

### evőeszköz (`ko`, 2 szó)

| Kép | Név | Azonosító | Kezdő | Végső | Szótag | Árnyék | Egyért. név | Csoport | Megjegyzés |
|---|---|---|---|---|---|---|---|---|---|
| 🥄 | **kanál** | `kanal` | k | l | 2 | igen | igen |  |  |
| 🍴 | **villa** | `villa` | v | a | 2 | igen | **nem** |  | a képen villa és kés is van |

### egyéb (`eb`, 19 szó)

| Kép | Név | Azonosító | Kezdő | Végső | Szótag | Árnyék | Egyért. név | Csoport | Megjegyzés |
|---|---|---|---|---|---|---|---|---|---|
| ⛄ | **hóember** | `hoember` | h | r | 3 | igen | igen |  |  |
| 🔥 | **tűz** | `tuz` | t | z | 1 | – | igen |  |  |
| 🏠 | **ház** | `haz` | h | z | 1 | igen | igen |  |  |
| 🍄 | **gomba** | `gomba` | g | a | 2 | – | igen |  | [ELLENŐRIZNI] a prototípusban zöldség volt; a gomba nem zöldség és nem növény, ezért az „egyéb” kategóriába tettem; a kép piros pöttyös gomba |
| 🦴 | **csont** | `csont` | cs | t | 1 | – | igen |  |  |
| 🕸️ | **pókháló** | `pokhalo` | p | ó | 3 | – | igen |  |  |
| 🪺 | **fészek** | `feszek` | f | k | 2 | – | igen |  |  |
| 🌧️ | **eső** | `eso` | e | ő | 2 | – | igen |  |  |
| 🥅 | **kapu** | `kapu` | k | u | 2 | – | **nem** |  | focikapu |
| 🛤️ | **sín** | `sin` | s | n | 1 | – | igen |  |  |
| ⛽ | **benzinkút** | `benzinkut` | b | t | 3 | – | **nem** |  | kút / töltőpisztoly |
| 🌊 | **víz** | `viz` | v | z | 1 | – | **nem** |  | hullám, víz |
| ❄️ | **hópehely** | `hopehely` | h | ly | 3 | – | igen |  | [ELLENŐRIZNI] az „ly” hangja j: kezdő/végső hangnál ne használjuk |
| 👑 | **korona** | `korona` | k | a | 3 | – | igen |  |  |
| 👸 | **királylány** | `kiralylany` | k | ny | 3 | – | igen |  |  |
| 😴 | **alvás** | `alvas` | a | s | 2 | – | **nem** |  | alvó arc |
| 👓 | **szemüveg** | `szemuveg` | sz | g | 3 | igen | igen |  |  |
| 🧊 | **jég** | `jeg` | j | g | 1 | – | igen |  |  |
| 👶 | **baba** | `baba` | b | a | 2 | – | **nem** |  | baba (csecsemő) |

## „Mi tartozik össze?” párok (tervezet, 41 db)

*A lapon a két kép közül véletlenül az egyik a feladat, a másik a megoldás. A változatossághoz kb. 80 pár kellene: kérlek, javasolj további párokat, vagy jelezd, melyik nem jó.*

| Egyik | Másik |
|---|---|
| 🐕 kutya | 🦴 csont |
| 🐝 méh | 🍯 méz |
| 🐔 tyúk | 🥚 tojás |
| 🐄 tehén | 🥛 tej |
| 🐒 majom | 🍌 banán |
| 🐇 nyuszi | 🥕 répa |
| 🐁 egér | 🧀 sajt |
| 🕷️ pók | 🕸️ pókháló |
| 🐦 madár | 🪺 fészek |
| 🦋 lepke | 🌷 virág |
| 🌧️ eső | ☂️ esernyő |
| ☁️ felhő | 🌧️ eső |
| 🔑 kulcs | 🚪 ajtó |
| 🧦 zokni | 🦶 láb |
| 👟 cipő | 🦶 láb |
| 🧤 kesztyű | ✋ kéz |
| ✏️ ceruza | 📓 füzet |
| 🪥 fogkefe | 🦷 fog |
| 🖌️ ecset | 🎨 festék |
| 🍼 cumisüveg | 👶 baba |
| ⚽ labda | 🥅 kapu |
| 🚂 vonat | 🛤️ sín |
| 🚗 autó | ⛽ benzinkút |
| ⛵ hajó | 🌊 víz |
| 🚀 rakéta | 🪐 bolygó |
| 🥄 kanál | 🍲 leves |
| ❄️ hópehely | ⛄ hóember |
| 🍰 torta | 🕯️ gyertya |
| ✉️ levél | 📮 postaláda |
| 👑 korona | 👸 királylány |
| 🚒 tűzoltóautó | 🔥 tűz |
| ✂️ olló | 📄 papír |
| 🎧 fejhallgató | 👂 fül |
| 👓 szemüveg | 👀 szem |
| 🛏️ ágy | 😴 alvás |
| 🐧 pingvin | 🧊 jég |
| 🍞 kenyér | 🧈 vaj |
| 🐈 cica | 🧶 gombolyag |
| 🪚 fűrész | 🌳 fa |
| ☀️ nap | 🌻 napraforgó |
| 🍪 keksz | 🥛 tej |

### További összetartozások (nem pár, de ütközést okoznak; 20 db)

*Ha egy lapon mindkét szó szerepelne, az egyik feladathoz két megoldás is illene: ezért nem kerülhetnek egy lapra.*

| Egyik | Másik |
|---|---|
| 🐝 méh | 🌷 virág |
| 🐈 cica | 🥛 tej |
| 🐈 cica | 🐁 egér |
| 🐦 madár | 🌳 fa |
| 🐒 majom | 🌳 fa |
| 👶 baba | 😴 alvás |
| 🛏️ ágy | 👶 baba |
| 🍼 cumisüveg | 🥛 tej |
| ❄️ hópehely | 🧊 jég |
| ⛄ hóember | 🧊 jég |
| 🌧️ eső | 🌊 víz |
| 🍞 kenyér | 🧀 sajt |
| 🍯 méz | 🍞 kenyér |
| 🥚 tojás | 🪺 fészek |
| 🐔 tyúk | 🪺 fészek |
| ✏️ ceruza | 📄 papír |
| ✂️ olló | 📓 füzet |
| 🖌️ ecset | 📄 papír |
| 🎨 festék | 📄 papír |
| 🚀 rakéta | ☀️ nap |
