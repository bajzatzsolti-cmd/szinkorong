# Szókincs és párok: jóváhagyásra

*Generálta: `npm run vocab:report` (scripts/vocab-report.mjs). Kézzel ne szerkeszd: a forrás a `content/szokincs.json`, `content/kategoriak.json` és `content/parok.json`.*

A szókincs a Színkorong központi szótára: minden képes feladat (árnyék, párok, csoportok, minták, később a hangtani feladatok is) ebből dolgozik.
**Kérlek, nézd át a besorolásokat, a jelzőket és a megjegyzéseket.** Ahol eltérést kérsz, elég megírnod a szót és a javítást.

## Összesítés

- 185 szó, 20 kategória, 101 szó jó árnyékú, 31 szónak nem egyértelmű a neve egy ötévesnek.
- 41 pár és 20 további összetartozás („also”) a „Mi tartozik össze?” témakörhöz.
- A képek az OpenMoji készletéből valók (CC BY-SA 4.0, lásd LICENSES.md).
- **Mért képjellemzők** (content/kepjellemzok.json, `npm run image-props`): a kép uralkodó színe, hogy van-e jól látható iránya (Kakukktojás: „másfelé néz”), és hogy féloldalas-e (az egyik felén alig van rajz: a Fél kép nem használja). Ezeket a gép méri a képekből; ha egy szín vagy irány nem stimmel, a szókincsben felülírható.
- **Súlyosztályok** (content/suly.json, tervezet): a Mérleg könnyű szintjéhez, 38 tárgyhoz.
- **Még üres, szándékosan:** a rímcsoport (a Hangoló plusz 4. sprintben, a rímpárokkal együtt).
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

Oszlopok: kép, név, azonosító, **kezdőhang**, **végső hang**, **szótagszám**, **jó árnyék** (felismerhető az árnyéka), **egyértelmű név**, csoportok (hasonló alakú árnyékok / iker-képek), **képjellemzők** (mért szín, irányos, féloldalas, súlyosztály), megjegyzés.

### állat (`al`, 27 szó)

| Kép | Név | Azonosító | Kezdő | Végső | Szótag | Árnyék | Egyért. név | Csoport | Képjellemzők | Megjegyzés |
|---|---|---|---|---|---|---|---|---|---|---|
| 🐕 | **kutya** | `kutya` | k | a | 2 | igen | igen | hasonló: negylaba | narancs · irányos · súly: ~10 kg |  |
| 🐈 | **cica** | `cica` | c | a | 2 | igen | igen | hasonló: negylaba | narancs · irányos |  |
| 🐁 | **egér** | `eger` | e | r | 2 | igen | igen | hasonló: negylaba | szürke · irányos |  |
| 🐇 | **nyuszi** | `nyuszi` | ny | i | 2 | igen | igen | hasonló: negylaba | szürke · irányos · súly: ~1 kg |  |
| 🦊 | **róka** | `roka` | r | a | 2 | – | igen |  | narancs |  |
| 🐻 | **medve** | `medve` | m | e | 2 | – | igen |  | barna · súly: ~100 kg |  |
| 🐖 | **malac** | `malac` | m | c | 2 | igen | **nem** | hasonló: negylaba | rózsaszín · irányos | a képen disznó is lehet |
| 🐄 | **tehén** | `tehen` | t | n | 2 | igen | **nem** | hasonló: negylaba | barna · irányos · súly: ~1 t | tehén vagy tőgyes tehén / marha |
| 🐸 | **béka** | `beka` | b | a | 2 | – | igen |  | zöld |  |
| 🐒 | **majom** | `majom` | m | m | 2 | igen | igen |  | barna · irányos · féloldalas |  |
| 🐎 | **ló** | `lo` | l | ó | 1 | igen | igen | hasonló: negylaba, iker: paripa | barna · irányos · súly: ~1 t | az árnyéka a zebráéhoz nagyon hasonló |
| 🐑 | **bárány** | `barany` | b | ny | 2 | igen | igen | hasonló: negylaba | fehér · irányos |  |
| 🐐 | **kecske** | `kecske` | k | e | 2 | igen | igen | hasonló: negylaba | barna · irányos · súly: ~100 kg |  |
| 🦌 | **szarvas** | `szarvas` | sz | s | 2 | igen | igen | hasonló: negylaba | barna · irányos · súly: ~100 kg |  |
| 🐪 | **teve** | `teve` | t | e | 2 | igen | igen | hasonló: negylaba | narancs · irányos · féloldalas · súly: ~1 t |  |
| 🐊 | **krokodil** | `krokodil` | k | l | 3 | igen | igen | hasonló: kuszo | zöld · irányos |  |
| 🐘 | **elefánt** | `elefant` | e | t | 3 | igen | igen | hasonló: nagy | szürke · irányos · súly: ~10 t |  |
| 🦒 | **zsiráf** | `zsiraf` | zs | f | 2 | igen | igen | hasonló: nagy | narancs · irányos · súly: ~1 t |  |
| 🦁 | **oroszlán** | `oroszlan` | o | n | 3 | – | igen |  | narancs · súly: ~100 kg |  |
| 🦓 | **zebra** | `zebra` | z | a | 2 | igen | igen | hasonló: negylaba, iker: paripa | fehér · irányos | az árnyéka a lóéhoz nagyon hasonló |
| 🐢 | **teknős** | `teknos` | t | s | 2 | igen | igen | hasonló: kuszo | zöld · irányos |  |
| 🐍 | **kígyó** | `kigyo` | k | ó | 2 | igen | igen | hasonló: kuszo | zöld · irányos |  |
| 🐟 | **hal** | `hal` | h | l | 1 | igen | igen | hasonló: vizi | kék · irányos |  |
| 🐬 | **delfin** | `delfin` | d | n | 2 | igen | igen | hasonló: vizi | szürke · irányos |  |
| 🦔 | **süni** | `suni` | s | i | 2 | igen | igen |  | barna · irányos |  |
| 🐿️ | **mókus** | `mokus` | m | s | 2 | igen | igen |  | barna · irányos |  |
| 🐌 | **csiga** | `csiga` | cs | a | 2 | igen | igen | hasonló: kuszo | barna · irányos · súly: ~10 g |  |

### madár (`ma`, 10 szó)

| Kép | Név | Azonosító | Kezdő | Végső | Szótag | Árnyék | Egyért. név | Csoport | Képjellemzők | Megjegyzés |
|---|---|---|---|---|---|---|---|---|---|---|
| 🐓 | **kakas** | `kakas` | k | s | 2 | igen | **nem** | hasonló: madar | barna · irányos | kakas vagy tyúk |
| 🐔 | **tyúk** | `tyuk` | ty | k | 1 | – | igen |  | fehér |  |
| 🦆 | **kacsa** | `kacsa` | k | a | 2 | igen | igen | hasonló: madar | barna · irányos |  |
| 🦉 | **bagoly** | `bagoly` | b | ly | 2 | igen | igen | hasonló: madar | szürke | szemből látszik: a tükörképe szinte ugyanolyan; [ELLENŐRIZNI] az „ly” hangja j: kezdő/végső hangnál ne használjuk |
| 🐧 | **pingvin** | `pingvin` | p | n | 2 | igen | igen | hasonló: madar | fehér | szemből látszik: a tükörképe szinte ugyanolyan |
| 🦢 | **hattyú** | `hattyu` | h | ú | 2 | igen | **nem** | hasonló: madar | fehér · irányos | hattyú vagy liba |
| 🐥 | **csibe** | `csibe` | cs | e | 2 | – | igen |  | sárga |  |
| 🕊️ | **galamb** | `galamb` | g | b | 2 | igen | igen | hasonló: madar | fehér · irányos |  |
| 🦜 | **papagáj** | `papagaj` | p | j | 3 | igen | igen | hasonló: madar | piros · irányos |  |
| 🐦 | **madár** | `madar` | m | r | 2 | – | igen |  | barna · irányos | általános madár: a Csoportosítóban csak a „madár” csoportot jelöli |

### bogár (`bo`, 7 szó)

| Kép | Név | Azonosító | Kezdő | Végső | Szótag | Árnyék | Egyért. név | Csoport | Képjellemzők | Megjegyzés |
|---|---|---|---|---|---|---|---|---|---|---|
| 🐝 | **méh** | `meh` | m | h | 1 | – | igen |  | sárga · irányos · súly: 1 g alatt |  |
| 🦋 | **lepke** | `lepke` | l | e | 2 | igen | **nem** |  | kék · súly: 1 g alatt | lepke vagy pillangó |
| 🐞 | **katica** | `katica` | k | a | 3 | – | **nem** |  | piros · súly: 1 g alatt | katica vagy katicabogár |
| 🐜 | **hangya** | `hangya` | h | a | 2 | igen | igen | hasonló: rovar | barna · súly: 1 g alatt |  |
| 🕷️ | **pók** | `pok` | p | k | 1 | igen | igen | hasonló: rovar | szürke · irányos | [ELLENŐRIZNI] a pók nem rovar, de a gyerekek a bogarak közé sorolják |
| 🐛 | **hernyó** | `hernyo` | h | ó | 2 | – | igen |  | zöld |  |
| 🦗 | **tücsök** | `tucsok` | t | k | 2 | – | igen |  | zöld · irányos | [ELLENŐRIZNI] ismeri-e a gyerek a tücsköt |

### gyümölcs (`gy`, 12 szó)

| Kép | Név | Azonosító | Kezdő | Végső | Szótag | Árnyék | Egyért. név | Csoport | Képjellemzők | Megjegyzés |
|---|---|---|---|---|---|---|---|---|---|---|
| 🍎 | **alma** | `alma` | a | a | 2 | igen | igen | hasonló: gyumolcs | piros · súly: ~100 g |  |
| 🍐 | **körte** | `korte` | k | e | 2 | igen | igen | hasonló: gyumolcs | zöld · irányos · súly: ~100 g |  |
| 🍌 | **banán** | `banan` | b | n | 2 | igen | igen | hasonló: gyumolcs | sárga · irányos · féloldalas · súly: ~100 g |  |
| 🍓 | **eper** | `eper` | e | r | 2 | igen | igen | hasonló: gyumolcs | piros · súly: ~10 g |  |
| 🍒 | **cseresznye** | `cseresznye` | cs | e | 3 | igen | igen | hasonló: gyumolcs | piros · irányos · súly: ~10 g |  |
| 🍇 | **szőlő** | `szolo` | sz | ő | 2 | igen | igen | hasonló: gyumolcs | lila |  |
| 🍉 | **dinnye** | `dinnye` | d | e | 2 | – | igen |  | piros · irányos · féloldalas |  |
| 🍋 | **citrom** | `citrom` | c | m | 2 | – | igen |  | sárga · irányos · súly: ~100 g |  |
| 🍊 | **narancs** | `narancs` | n | cs | 2 | – | igen |  | sárga |  |
| 🍑 | **barack** | `barack` | b | k | 2 | – | igen |  | rózsaszín |  |
| 🍍 | **ananász** | `ananasz` | a | sz | 3 | igen | igen | hasonló: gyumolcs | barna · súly: ~1 kg |  |
| 🥝 | **kivi** | `kivi` | k | i | 2 | – | igen |  | zöld |  |

### zöldség (`zo`, 8 szó)

| Kép | Név | Azonosító | Kezdő | Végső | Szótag | Árnyék | Egyért. név | Csoport | Képjellemzők | Megjegyzés |
|---|---|---|---|---|---|---|---|---|---|---|
| 🥕 | **répa** | `repa` | r | a | 2 | igen | igen |  | narancs · irányos |  |
| 🍅 | **paradicsom** | `paradicsom` | p | m | 4 | – | igen |  | piros | [ELLENŐRIZNI] a paradicsom zöldség, de piros és kerek, mint az alma: a gyerek gyümölcsnek nézheti (Csoportosító) |
| 🥒 | **uborka** | `uborka` | u | a | 3 | – | igen |  | zöld · irányos |  |
| 🌽 | **kukorica** | `kukorica` | k | a | 4 | – | igen |  | zöld · irányos |  |
| 🥔 | **krumpli** | `krumpli` | k | i | 2 | – | igen |  | barna · irányos |  |
| 🧅 | **hagyma** | `hagyma` | h | a | 2 | – | igen |  | narancs |  |
| 🥦 | **brokkoli** | `brokkoli` | b | i | 3 | igen | igen |  | zöld |  |
| 🫑 | **paprika** | `paprika` | p | a | 3 | – | igen |  | piros |  |

### étel, ital (`et`, 10 szó)

| Kép | Név | Azonosító | Kezdő | Végső | Szótag | Árnyék | Egyért. név | Csoport | Képjellemzők | Megjegyzés |
|---|---|---|---|---|---|---|---|---|---|---|
| 🍞 | **kenyér** | `kenyer` | k | r | 2 | – | igen |  | sárga · súly: ~1 kg |  |
| 🧀 | **sajt** | `sajt` | s | t | 1 | – | igen |  | sárga |  |
| 🥚 | **tojás** | `tojas` | t | s | 2 | – | igen |  | fehér · súly: ~100 g |  |
| 🥛 | **tej** | `tej` | t | j | 1 | – | igen |  | fehér |  |
| 🍯 | **méz** | `mez` | m | z | 1 | – | igen |  | narancs |  |
| 🥐 | **kifli** | `kifli` | k | i | 2 | igen | igen |  | narancs | [ELLENŐRIZNI] a kép croissant: kiflinek ismeri-e fel a gyerek |
| 🍕 | **pizza** | `pizza` | p | a | 2 | – | igen |  | sárga |  |
| 🥞 | **palacsinta** | `palacsinta` | p | a | 4 | – | **nem** |  | sárga | palacsinta vagy amerikai palacsinta |
| 🧈 | **vaj** | `vaj` | v | j | 1 | – | igen |  | sárga |  |
| 🍲 | **leves** | `leves` | l | s | 2 | – | **nem** |  | fehér | leves vagy főzelék, étel a fazékban |

### édesség (`ed`, 7 szó)

| Kép | Név | Azonosító | Kezdő | Végső | Szótag | Árnyék | Egyért. név | Csoport | Képjellemzők | Megjegyzés |
|---|---|---|---|---|---|---|---|---|---|---|
| 🍰 | **torta** | `torta` | t | a | 2 | – | igen |  | sárga |  |
| 🍦 | **fagyi** | `fagyi` | f | i | 2 | igen | igen |  | sárga |  |
| 🍭 | **nyalóka** | `nyaloka` | ny | a | 3 | igen | igen |  | piros · irányos · féloldalas |  |
| 🍫 | **csoki** | `csoki` | cs | i | 2 | – | igen |  | piros |  |
| 🍪 | **keksz** | `keksz` | k | sz | 1 | – | igen |  | barna |  |
| 🍬 | **cukorka** | `cukorka` | c | a | 3 | igen | igen |  | zöld · irányos · súly: ~10 g |  |
| 🍩 | **fánk** | `fank` | f | k | 1 | igen | igen |  | sárga · súly: ~100 g |  |

### jármű (`ja`, 14 szó)

| Kép | Név | Azonosító | Kezdő | Végső | Szótag | Árnyék | Egyért. név | Csoport | Képjellemzők | Megjegyzés |
|---|---|---|---|---|---|---|---|---|---|---|
| 🚗 | **autó** | `auto` | a | ó | 3 | igen | igen | iker: auto | piros · irányos · súly: ~1 t | [ELLENŐRIZNI] szótagszám: az „au/eu” egy vagy két szótag? (autó: au-tó = 2?) |
| 🚌 | **busz** | `busz` | b | sz | 1 | igen | igen | hasonló: kerekes | piros · irányos · súly: ~10 t |  |
| 🚂 | **vonat** | `vonat` | v | t | 2 | igen | igen | hasonló: kerekes | szürke · irányos |  |
| ✈️ | **repülő** | `repulo` | r | ő | 3 | igen | igen | hasonló: leg | szürke · irányos |  |
| 🚁 | **helikopter** | `helikopter` | h | r | 4 | igen | igen | hasonló: leg | piros · irányos |  |
| 🚲 | **bicikli** | `bicikli` | b | i | 3 | igen | igen | hasonló: ketkerekes | fehér · irányos · súly: ~10 kg |  |
| ⛵ | **hajó** | `hajo` | h | ó | 2 | igen | **nem** |  | kék · irányos | hajó vagy vitorlás |
| 🚀 | **rakéta** | `raketa` | r | a | 3 | igen | igen | hasonló: leg | piros · irányos |  |
| 🚜 | **traktor** | `traktor` | t | r | 2 | igen | igen | hasonló: kerekes | zöld · irányos · súly: ~10 t |  |
| 🛴 | **roller** | `roller` | r | r | 2 | igen | **nem** | hasonló: ketkerekes | szürke · irányos · súly: ~10 kg |  |
| 🏍️ | **motor** | `motor` | m | r | 2 | – | **nem** | hasonló: ketkerekes | piros · irányos · súly: ~100 kg | motor vagy motorbicikli |
| 🚒 | **tűzoltóautó** | `tuzoltoauto` | t | ó | 6 | igen | igen | iker: auto | piros | [ELLENŐRIZNI] szótagszám: az „au/eu” egy vagy két szótag? (autó: au-tó = 2?) |
| 🚑 | **mentő** | `mento` | m | ő | 2 | igen | igen | iker: auto | fehér · irányos |  |
| 🚓 | **rendőrautó** | `rendorauto` | r | ó | 5 | igen | igen | iker: auto | szürke · irányos | [ELLENŐRIZNI] szótagszám: az „au/eu” egy vagy két szótag? (autó: au-tó = 2?) |

### ruha (`ru`, 11 szó)

| Kép | Név | Azonosító | Kezdő | Végső | Szótag | Árnyék | Egyért. név | Csoport | Képjellemzők | Megjegyzés |
|---|---|---|---|---|---|---|---|---|---|---|
| 👕 | **póló** | `polo` | p | ó | 2 | igen | **nem** | hasonló: felsoruha | kék | póló vagy ing |
| 👖 | **nadrág** | `nadrag` | n | g | 2 | igen | igen |  | kék · irányos |  |
| 👗 | **ruha** | `ruha` | r | a | 2 | igen | **nem** | hasonló: felsoruha | kék | ruha vagy szoknya |
| 🧦 | **zokni** | `zokni` | z | i | 2 | igen | igen | hasonló: lablab | narancs · irányos |  |
| 🧤 | **kesztyű** | `kesztyu` | k | ű | 2 | igen | igen |  | piros |  |
| 🧣 | **sál** | `sal` | s | l | 1 | – | igen |  | piros · irányos |  |
| 👟 | **cipő** | `cipo` | c | ő | 2 | igen | igen | hasonló: lablab | szürke · irányos |  |
| 🧢 | **sapka** | `sapka` | s | a | 2 | igen | igen |  | zöld · irányos |  |
| 👢 | **csizma** | `csizma` | cs | a | 2 | igen | igen | hasonló: lablab | barna · irányos · féloldalas · súly: ~1 kg |  |
| 🧥 | **kabát** | `kabat` | k | t | 2 | – | igen | hasonló: felsoruha | barna |  |
| 👒 | **kalap** | `kalap` | k | p | 2 | igen | igen |  | sárga |  |

### hangszer (`ha`, 6 szó)

| Kép | Név | Azonosító | Kezdő | Végső | Szótag | Árnyék | Egyért. név | Csoport | Képjellemzők | Megjegyzés |
|---|---|---|---|---|---|---|---|---|---|---|
| 🎸 | **gitár** | `gitar` | g | r | 2 | igen | igen | hasonló: hur | piros · irányos · féloldalas |  |
| 🎹 | **zongora** | `zongora` | z | a | 3 | – | igen |  | fehér |  |
| 🥁 | **dob** | `dob` | d | b | 1 | igen | igen |  | piros |  |
| 🎺 | **trombita** | `trombita` | t | a | 3 | igen | igen | hasonló: fuvos | sárga · irányos |  |
| 🎻 | **hegedű** | `hegedu` | h | ű | 3 | igen | igen | hasonló: hur | barna · irányos · féloldalas |  |
| 🎷 | **szaxofon** | `szaxofon` | sz | n | 3 | igen | igen | hasonló: fuvos | sárga · irányos · féloldalas |  |

### az égen, az űrben (`eg`, 6 szó)

| Kép | Név | Azonosító | Kezdő | Végső | Szótag | Árnyék | Egyért. név | Csoport | Képjellemzők | Megjegyzés |
|---|---|---|---|---|---|---|---|---|---|---|
| ☀️ | **nap** | `nap` | n | p | 1 | – | igen |  | sárga |  |
| 🌙 | **hold** | `hold` | h | d | 1 | igen | igen |  | sárga · irányos · féloldalas |  |
| ⭐ | **csillag** | `csillag` | cs | g | 2 | igen | igen |  | sárga |  |
| ☁️ | **felhő** | `felho` | f | ő | 2 | igen | igen |  | szürke |  |
| 🌈 | **szivárvány** | `szivarvany` | sz | ny | 3 | – | igen |  | piros · irányos |  |
| 🪐 | **bolygó** | `bolygo` | b | ó | 2 | – | igen |  | piros · irányos | [ELLENŐRIZNI] ismeri-e a gyerek a bolygót (gyűrűs bolygó a képen) |

### játék (`jt`, 5 szó)

| Kép | Név | Azonosító | Kezdő | Végső | Szótag | Árnyék | Egyért. név | Csoport | Képjellemzők | Megjegyzés |
|---|---|---|---|---|---|---|---|---|---|---|
| 🧸 | **maci** | `maci` | m | i | 2 | igen | igen |  | barna |  |
| ⚽ | **labda** | `labda` | l | a | 2 | – | igen |  | fehér |  |
| 🎈 | **lufi** | `lufi` | l | i | 2 | igen | igen |  | piros · irányos · féloldalas |  |
| 🪁 | **sárkány** | `sarkany` | s | ny | 2 | igen | **nem** |  | rózsaszín · irányos · féloldalas | papírsárkány (nem a mesebeli sárkány) |
| 🎲 | **kocka** | `kocka` | k | a | 2 | – | **nem** |  | szürke | dobókocka |

### szerszám (`sz`, 4 szó)

| Kép | Név | Azonosító | Kezdő | Végső | Szótag | Árnyék | Egyért. név | Csoport | Képjellemzők | Megjegyzés |
|---|---|---|---|---|---|---|---|---|---|---|
| 🔨 | **kalapács** | `kalapacs` | k | cs | 3 | igen | igen | hasonló: szerszam | szürke · irányos · súly: ~1 kg |  |
| 🪚 | **fűrész** | `furesz` | f | sz | 2 | igen | igen | hasonló: szerszam | szürke · irányos |  |
| 🔧 | **csavarkulcs** | `csavarkulcs` | cs | cs | 3 | igen | **nem** | hasonló: szerszam | szürke |  |
| 🪛 | **csavarhúzó** | `csavarhuzo` | cs | ó | 4 | – | igen |  | narancs · irányos · féloldalas |  |

### növény (`no`, 5 szó)

| Kép | Név | Azonosító | Kezdő | Végső | Szótag | Árnyék | Egyért. név | Csoport | Képjellemzők | Megjegyzés |
|---|---|---|---|---|---|---|---|---|---|---|
| 🌳 | **fa** | `fa` | f | a | 1 | igen | igen |  | zöld · irányos |  |
| 🌷 | **virág** | `virag` | v | g | 2 | – | **nem** |  | narancs · irányos | tulipán |
| 🌻 | **napraforgó** | `napraforgo` | n | ó | 4 | – | igen |  | sárga · irányos |  |
| 🌵 | **kaktusz** | `kaktusz` | k | sz | 2 | igen | igen |  | zöld · irányos |  |
| 🌲 | **fenyő** | `fenyo` | f | ő | 2 | igen | igen |  | zöld |  |

### testrész (`te`, 5 szó)

| Kép | Név | Azonosító | Kezdő | Végső | Szótag | Árnyék | Egyért. név | Csoport | Képjellemzők | Megjegyzés |
|---|---|---|---|---|---|---|---|---|---|---|
| 🦶 | **láb** | `lab` | l | b | 1 | – | igen |  | sárga · irányos · féloldalas |  |
| ✋ | **kéz** | `kez` | k | z | 1 | – | igen |  | sárga · irányos |  |
| 👂 | **fül** | `ful` | f | l | 1 | – | igen |  | sárga · irányos |  |
| 🦷 | **fog** | `fog` | f | g | 1 | – | igen |  | fehér |  |
| 👀 | **szem** | `szem` | sz | m | 1 | – | **nem** |  | fehér | két szem |

### háztartási tárgy (`hz`, 17 szó)

| Kép | Név | Azonosító | Kezdő | Végső | Szótag | Árnyék | Egyért. név | Csoport | Képjellemzők | Megjegyzés |
|---|---|---|---|---|---|---|---|---|---|---|
| 🪜 | **létra** | `letra` | l | a | 2 | igen | igen |  | barna · irányos |  |
| 🧹 | **seprű** | `sepru` | s | ű | 2 | igen | igen |  | sárga · irányos · féloldalas |  |
| 🪣 | **vödör** | `vodor` | v | r | 2 | igen | igen |  | kék |  |
| 🔑 | **kulcs** | `kulcs` | k | cs | 1 | igen | igen |  | narancs · irányos · súly: ~10 g |  |
| 💡 | **lámpa** | `lampa` | l | a | 2 | igen | **nem** |  | sárga | villanykörte |
| ⏰ | **óra** | `ora` | ó | a | 2 | – | **nem** |  | fehér | ébresztőóra |
| 🚪 | **ajtó** | `ajto` | a | ó | 2 | – | igen |  | barna |  |
| ☂️ | **esernyő** | `esernyo` | e | ő | 3 | igen | igen |  | lila |  |
| 🎁 | **ajándék** | `ajandek` | a | k | 3 | igen | igen |  | sárga |  |
| ☎️ | **telefon** | `telefon` | t | n | 3 | – | **nem** |  | piros | régi, tárcsás telefon |
| 🪥 | **fogkefe** | `fogkefe` | f | e | 3 | – | igen |  | kék · irányos |  |
| 🍼 | **cumisüveg** | `cumisuveg` | c | g | 4 | – | igen |  | kék · irányos |  |
| 🕯️ | **gyertya** | `gyertya` | gy | a | 2 | – | igen |  | fehér |  |
| ✉️ | **levél** | `level` | l | l | 2 | – | igen |  | szürke |  |
| 📮 | **postaláda** | `postalada` | p | a | 4 | – | igen |  | piros |  |
| 🎧 | **fejhallgató** | `fejhallgato` | f | ó | 4 | – | igen |  | szürke |  |
| 🧶 | **gombolyag** | `gombolyag` | g | g | 3 | – | **nem** |  | narancs · irányos | gombolyag, fonal |

### bútor (`bu`, 3 szó)

| Kép | Név | Azonosító | Kezdő | Végső | Szótag | Árnyék | Egyért. név | Csoport | Képjellemzők | Megjegyzés |
|---|---|---|---|---|---|---|---|---|---|---|
| 🪑 | **szék** | `szek` | sz | k | 1 | igen | igen |  | sárga · irányos · súly: ~10 kg |  |
| 🛏️ | **ágy** | `agy` | á | gy | 1 | – | igen |  | kék |  |
| 🛋️ | **kanapé** | `kanape` | k | é | 3 | – | **nem** |  | kék · irányos | kanapé és lámpa |

### iskolai, rajzoló eszköz (`is`, 7 szó)

| Kép | Név | Azonosító | Kezdő | Végső | Szótag | Árnyék | Egyért. név | Csoport | Képjellemzők | Megjegyzés |
|---|---|---|---|---|---|---|---|---|---|---|
| 📚 | **könyv** | `konyv` | k | v | 1 | – | igen |  | fehér |  |
| ✂️ | **olló** | `ollo` | o | ó | 2 | igen | igen |  | piros · irányos |  |
| ✏️ | **ceruza** | `ceruza` | c | a | 3 | igen | igen |  | narancs · irányos · súly: ~10 g |  |
| 📓 | **füzet** | `fuzet` | f | t | 2 | – | igen |  | szürke |  |
| 🖌️ | **ecset** | `ecset` | e | t | 2 | – | igen |  | kék · irányos |  |
| 🎨 | **festék** | `festek` | f | k | 2 | – | **nem** |  | barna · irányos | festékpaletta |
| 📄 | **papír** | `papir` | p | r | 2 | – | **nem** |  | szürke · irányos | papírlap |

### evőeszköz (`ko`, 2 szó)

| Kép | Név | Azonosító | Kezdő | Végső | Szótag | Árnyék | Egyért. név | Csoport | Képjellemzők | Megjegyzés |
|---|---|---|---|---|---|---|---|---|---|---|
| 🥄 | **kanál** | `kanal` | k | l | 2 | igen | igen |  | szürke · irányos · féloldalas |  |
| 🍴 | **villa** | `villa` | v | a | 2 | igen | **nem** |  | szürke · irányos | a képen villa és kés is van |

### egyéb (`eb`, 19 szó)

| Kép | Név | Azonosító | Kezdő | Végső | Szótag | Árnyék | Egyért. név | Csoport | Képjellemzők | Megjegyzés |
|---|---|---|---|---|---|---|---|---|---|---|
| ⛄ | **hóember** | `hoember` | h | r | 3 | igen | igen |  | fehér |  |
| 🔥 | **tűz** | `tuz` | t | z | 1 | – | igen |  | sárga |  |
| 🏠 | **ház** | `haz` | h | z | 1 | igen | igen |  | fehér |  |
| 🍄 | **gomba** | `gomba` | g | a | 2 | – | igen |  | piros | [ELLENŐRIZNI] a prototípusban zöldség volt; a gomba nem zöldség és nem növény, ezért az „egyéb” kategóriába tettem; a kép piros pöttyös gomba |
| 🦴 | **csont** | `csont` | cs | t | 1 | – | igen |  | fehér · irányos |  |
| 🕸️ | **pókháló** | `pokhalo` | p | ó | 3 | – | igen |  | szürke |  |
| 🪺 | **fészek** | `feszek` | f | k | 2 | – | igen |  | barna |  |
| 🌧️ | **eső** | `eso` | e | ő | 2 | – | igen |  | szürke |  |
| 🥅 | **kapu** | `kapu` | k | u | 2 | – | **nem** |  | szürke | focikapu |
| 🛤️ | **sín** | `sin` | s | n | 1 | – | igen |  | barna |  |
| ⛽ | **benzinkút** | `benzinkut` | b | t | 3 | – | **nem** |  | szürke · irányos | kút / töltőpisztoly |
| 🌊 | **víz** | `viz` | v | z | 1 | – | **nem** |  | kék · irányos | hullám, víz |
| ❄️ | **hópehely** | `hopehely` | h | ly | 3 | – | igen |  | fekete | [ELLENŐRIZNI] az „ly” hangja j: kezdő/végső hangnál ne használjuk |
| 👑 | **korona** | `korona` | k | a | 3 | – | igen |  | sárga |  |
| 👸 | **királylány** | `kiralylany` | k | ny | 3 | – | igen |  | sárga |  |
| 😴 | **alvás** | `alvas` | a | s | 2 | – | **nem** |  | sárga | alvó arc |
| 👓 | **szemüveg** | `szemuveg` | sz | g | 3 | igen | igen |  | szürke · irányos |  |
| 🧊 | **jég** | `jeg` | j | g | 1 | – | igen |  | kék |  |
| 👶 | **baba** | `baba` | b | a | 2 | – | **nem** |  | kék | baba (csecsemő) |

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
