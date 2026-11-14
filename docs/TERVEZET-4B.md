# 4b tervezetek: jóváhagyásra

*Generálta: `npm run tervezet:report`. Kézzel ne szerkeszd: a forrás a `content/holvan.json`, `content/haakkor.json` és `content/rimek.json` (ezek kód nélkül szerkeszthetők).*

**Kérlek, nézd át a mondatokat, a szintbeosztást és a jelölt bizonytalanságokat.** Ahol eltérést kérsz, elég megírnod az azonosítót és a javítást. A hangfájlok csak a jóváhagyás után készülnek el (kreditet csak egyszer költünk rájuk).

## Hol van? (relációszókincs, hallás után)

- Egy lapon minden képen ugyanaz a szereplő; így csak a viszonyszó (és a tárgy) dönt (terv, 10. kérdés).
- Jobbra–balra: a képet néző gyerek szemszögéből (az ő jobb keze felé), nem a szereplőéből.
- A „mellett” és a „jobbra/balra” nem lehet egy lapon ugyanazzal a tárggyal (a jobbra álló szereplő „mellett” is van).
- Az „előtt” és a „mögött” rajza: takarással (előtt: a szereplő takarja a tárgyat; mögött: a tárgy takarja a szereplőt).
- A tárgyak saját, szemből rajzolt képek (az OpenMoji doboza zárt, a széke és az ágya oldalnézetű, a kosarának füle van). A doboz csak a „benne” képen nyitott.

**Szintbeosztás (javaslat):**

- **1. szint (6 korong):** egy szereplő, egy tárgy, 6 viszony az alatt, rajta, benne, mellett, fölött, előtt, mögött, között közül (amit a tárgy tud)
- **2. szint (8 korong):** egy szereplő, két tárgy, 4 + 4 viszony ugyanezekből
- **3. szint (10 korong):** egy szereplő, két tárgy, 5 + 5 viszony: tárgyanként jobbra és balra + 3 másik (a mellett és a mögött ilyenkor kimarad, mert oldalt állnak)

**Viszonyok és rajzuk:**

| Viszony | Szint | Hogyan rajzolom |
|---|---|---|
| alatt | 1. | a szereplő a tárgy alatt, a földön |
| rajta | 1. | a szereplő a tárgy tetején, érintve |
| benne | 1. | a szereplő a tárgyban, csak a felső része látszik ki |
| mellett | 1. | a szereplő a tárgy mellett, a földön (a jobb–bal lapokon nem szerepel) |
| fölött | 1. | a szereplő a tárgy fölött a levegőben, nem érinti [ELLENŐRIZNI: a lebegő cica/kutya furcsa lehet] |
| előtt | 2. | a szereplő a tárgy előtt, takarja a tárgy alsó részét |
| mögött | 2. | a tárgy oldalt takarja a szereplőt (kb. a fele látszik); a széknél nincs, mert a szék szemből átlátszó a lábai között, és a mögötte álló szereplő ugyanúgy nézne ki, mint az alatta lévő |
| között | 1. | két egyforma tárgy, a szereplő a kettő között |
| jobbra | 3. | a szereplő a tárgytól jobbra, a KÉPET NÉZŐ gyerek jobb keze felé |
| balra | 3. | a szereplő a tárgytól balra, a képet néző gyerek bal keze felé |

**Szereplők:** 🐈 cica, 🐕 kutya, 🧸 maci, ⚽ labda.
**Tárgyak:** szék (**saját rajz (szemből)** [nincs a szókincsben]), ágy (**saját rajz (szemből)** [nincs a szókincsben]), doboz (**saját rajz (szemből)** [nincs a szókincsben]), kosár (**saját rajz (szemből)** [nincs a szókincsben]).

**Mondatok (132 db), a cicával; a többi szereplővel ugyanígy:**

| Azonosító | Mondat |
|---|---|
| `cica-szek-alatt` | A cica a szék alatt van. |
| `cica-szek-folott` | A cica a szék fölött van. |
| `cica-szek-rajta` | A cica a széken van. |
| `cica-szek-mellett` | A cica a szék mellett van. |
| `cica-szek-elott` | A cica a szék előtt van. |
| `cica-szek-kozott` | A cica a két szék között van. |
| `cica-szek-jobbra` | A cica a széktől jobbra van. |
| `cica-szek-balra` | A cica a széktől balra van. |
| `cica-agy-alatt` | A cica az ágy alatt van. |
| `cica-agy-folott` | A cica az ágy fölött van. |
| `cica-agy-rajta` | A cica az ágyon van. |
| `cica-agy-mellett` | A cica az ágy mellett van. |
| `cica-agy-elott` | A cica az ágy előtt van. |
| `cica-agy-kozott` | A cica a két ágy között van. |
| `cica-agy-jobbra` | A cica az ágytól jobbra van. |
| `cica-agy-balra` | A cica az ágytól balra van. |
| `cica-doboz-benne` | A cica a dobozban van. |
| `cica-doboz-rajta` | A cica a dobozon van. |
| `cica-doboz-folott` | A cica a doboz fölött van. |
| `cica-doboz-mellett` | A cica a doboz mellett van. |
| `cica-doboz-mogott` | A cica a doboz mögött van. |
| `cica-doboz-elott` | A cica a doboz előtt van. |
| `cica-doboz-kozott` | A cica a két doboz között van. |
| `cica-doboz-jobbra` | A cica a doboztól jobbra van. |
| `cica-doboz-balra` | A cica a doboztól balra van. |
| `cica-kosar-benne` | A cica a kosárban van. |
| `cica-kosar-folott` | A cica a kosár fölött van. |
| `cica-kosar-mellett` | A cica a kosár mellett van. |
| `cica-kosar-mogott` | A cica a kosár mögött van. |
| `cica-kosar-elott` | A cica a kosár előtt van. |
| `cica-kosar-kozott` | A cica a két kosár között van. |
| `cica-kosar-jobbra` | A cica a kosártól jobbra van. |
| `cica-kosar-balra` | A cica a kosártól balra van. |

## Ha–akkor (tapasztalati következtetés, hallás után)

- Csak logikailag érvényes következtetés (terv, 11. kérdés): a „Ha esik, esernyőt viszünk. Nem esik. Mit nem viszünk?” típus NEM szerepel, mert nem érvényes.
- 1. szint: ha A, akkor B; A igaz; mi következik? (a feltétel szó szerint elhangzik)
- 2. szint: ugyanez, de a feltétel csak burkoltan derül ki („kopog az eső az ablakon” = esik)
- 3. szint: vagy–vagy és tagadás („Vagy almát eszünk, vagy banánt. Almát nem eszünk. Mit eszünk?”); itt a kizárt kép (alma) szándékosan lehet a lapon, az a próbatétel
- A tagadott következmény („nem szaladt el a cica, ugatott-e a kutya?”) igen/nem választ adna, nem képet: ezért kimarad.

### 1. szint (15 feladat)

| Azonosító | Amit a gyerek hall | Megoldás | Nem lehet vele egy lapon |
|---|---|---|---|
| `eso-esernyo` | Ha esik az eső, esernyőt viszünk. Esik az eső. Mit viszünk? | ☂️ esernyő | 👢 csizma, 🧥 kabát |
| `hideg-sapka` | Ha hideg van, sapkát veszünk fel. Hideg van. Mit veszünk fel? | 🧢 sapka | 🧣 sál, 🧤 kesztyű, 🧥 kabát, 👢 csizma |
| `kutya-csont` | Ha éhes a kutya, csontot kap. Éhes a kutya. Mit kap? | 🦴 csont | – |
| `sotet-gyertya` | Ha sötét van, gyertyát gyújtunk. Sötét van. Mit gyújtunk? | 🕯️ gyertya | 🔥 tűz |
| `fogmosas-fogkefe` | Ha fogat mosunk, elővesszük a fogkefét. Fogat mosunk. Mit veszünk elő? | 🪥 fogkefe | – |
| `leves-kanal` | Ha levest eszünk, kanalat kérünk. Levest eszünk. Mit kérünk? | 🥄 kanál | – |
| `ho-hoember` | Ha esik a hó, hóembert építünk. Esik a hó. Mit építünk? | ⛄ hóember | ❄️ hópehely |
| `ajto-kulcs` | Ha zárva van az ajtó, kulcs kell hozzá. Zárva van az ajtó. Mi kell hozzá? | 🔑 kulcs | 🚪 ajtó |
| `nyuszi-repa` | Ha éhes a nyuszi, répát eszik. Éhes a nyuszi. Mit eszik? | 🥕 répa | – |
| `szulinap-torta` | Ha születésnap van, tortát sütünk. Ma van a maci születésnapja. Mit sütünk? | 🍰 torta | 🎈 lufi, 🎁 ajándék, 🕯️ gyertya |
| `cica-tej` | Ha szomjas a cica, tejet kap. Szomjas a cica. Mit kap? | 🥛 tej | – |
| `baba-cumisuveg` | Ha sír a kisbaba, cumisüveget kap. Sír a kisbaba. Mit kap? | 🍼 cumisüveg | – |
| `rajz-ceruza` | Ha rajzolni akarunk, ceruzát veszünk elő. Rajzolni akarunk. Mit veszünk elő? | ✏️ ceruza | 🖌️ ecset, 📓 füzet |
| `level-postalada` | Ha levelet kapunk, a postaládában találjuk. Levelet kaptunk. Hol találjuk? | 📮 postaláda | ✉️ levél |
| `almos-agy` | Ha álmosak vagyunk, ágyba bújunk. Álmosak vagyunk. Hová bújunk? | 🛏️ ágy | – |

### 2. szint (15 feladat)

| Azonosító | Amit a gyerek hall | Megoldás | Nem lehet vele egy lapon |
|---|---|---|---|
| `fagy-kesztyu` | Ha hideg van, kesztyűt húzunk. Kint minden fehér, és befagyott a tó. Mit húzunk? | 🧤 kesztyű | 🧢 sapka, 🧣 sál, 🧥 kabát, 👢 csizma, 🧊 jég |
| `kopog-csizma` | Ha esik az eső, csizmát húzunk. Kopognak az esőcseppek az ablakon. Mit húzunk? | 👢 csizma | ☂️ esernyő, 🧥 kabát, 🌧️ eső |
| `meh-mez` | Ha a méhecske virágot talál, mézet készít. A méhecske rászállt egy virágra. Mit készít? | 🍯 méz | 🐝 méh |
| `kutya-labda` | Ha a kutya játszani akar, labdát dobunk neki. A kutya csóválja a farkát, és játszani hív. Mit dobunk neki? | ⚽ labda | 🦴 csont |
| `reggeli-kenyer` | Ha reggelizünk, vajas kenyeret eszünk. Reggel van, már ülünk az asztalnál. Mit eszünk? | 🍞 kenyér | 🧈 vaj, 🥛 tej, 🥚 tojás |
| `tyuk-tojas` | Ha a tyúk tojik, tojást találunk a fészekben. Kotkodácsol a tyúk a fészkén. Mit találunk? | 🥚 tojás | 🐔 tyúk, 🪺 fészek, 🐥 csibe |
| `meleg-fagyi` | Ha nagyon meleg van, fagyit eszünk. Tűz a nap, mindenki izzad. Mit eszünk? | 🍦 fagyi | ☀️ nap |
| `zene-dob` | Ha zenélünk, a maci a dobot üti. Megszólal a zene, zenélünk. Mit üt a maci? | 🥁 dob | 🧸 maci |
| `bal-korona` | Ha a királylány bálba megy, koronát tesz a fejére. A királylány indul a bálba. Mit tesz a fejére? | 👑 korona | 👸 királylány, 👒 kalap |
| `este-hold` | Ha beesteledik, feljön a hold. Lement a nap, és sötét lett. Mi jön fel? | 🌙 hold | ⭐ csillag, ☀️ nap |
| `eso-szivarvany` | Ha eső után kisüt a nap, szivárvány lesz az égen. Elállt az eső, és kisütött a nap. Mi lesz az égen? | 🌈 szivárvány | ☀️ nap, 🌧️ eső, ☁️ felhő |
| `szulinap-lufi` | Ha születésnapi zsúr van, lufit fújunk. Ma van a maci zsúrja, jönnek a vendégek. Mit fújunk? | 🎈 lufi | 🍰 torta, 🎁 ajándék, 🕯️ gyertya, 🧸 maci |
| `polc-letra` | Ha valami magasan van, létrára állunk. A könyv a legfelső polcon van. Mire állunk? | 🪜 létra | 📚 könyv, 🪑 szék |
| `morzsa-sepru` | Ha piszkos a padló, söprűt veszünk elő. Morzsás lett a padló. Mit veszünk elő? | 🧹 seprű | – |
| `virag-vodor` | Ha szomjasak a virágok, vödörrel hozunk nekik vizet. Lekonyultak a virágok. Mivel hozunk vizet? | 🪣 vödör | 🌻 napraforgó |

### 3. szint (15 feladat)

| Azonosító | Amit a gyerek hall | Megoldás | Nem lehet vele egy lapon |
|---|---|---|---|
| `alma-banan` | Vagy almát eszünk, vagy banánt. Almát nem eszünk. Mit eszünk? | 🍌 banán | – |
| `sapka-kalap` | Vagy sapkát veszünk fel, vagy kalapot. Kalapot nem veszünk fel. Mit veszünk fel? | 🧢 sapka | – |
| `szek-agy` | A maci vagy a széken ül, vagy az ágyon. A széken nem ül. Hol ül? | 🛏️ ágy | 🧸 maci |
| `bicikli-busz` | Vagy biciklivel megyünk, vagy busszal. Busszal nem megyünk. Mivel megyünk? | 🚲 bicikli | – |
| `gitar-zongora` | Vagy gitározunk, vagy zongorázunk. Gitározni nem fogunk. Min játszunk? | 🎹 zongora | – |
| `torta-fank` | Vagy tortát eszünk, vagy fánkot. Tortát nem eszünk. Mit eszünk? | 🍩 fánk | – |
| `vonat-repulo` | Vagy vonattal utazunk, vagy repülővel. Repülővel nem utazunk. Mivel utazunk? | 🚂 vonat | – |
| `ceruza-ecset` | Vagy ceruzával rajzolunk, vagy ecsettel festünk. Ecsetet nem veszünk elő. Mivel rajzolunk? | ✏️ ceruza | – |
| `cipo-csizma` | Vagy cipőt húzunk, vagy csizmát. Csizmát nem húzunk. Mit húzunk? | 👟 cipő | – |
| `eper-cseresznye` | Vagy epret szedünk, vagy cseresznyét. Epret nem szedünk. Mit szedünk? | 🍒 cseresznye | – |
| `trombita-dob` | A maci vagy trombitál, vagy dobol. Dobolni nem fog. Mit fúj? | 🎺 trombita | 🧸 maci |
| `narancs-citrom` | Vagy narancsot hámozunk, vagy citromot. Citromot nem hámozunk. Mit hámozunk? | 🍊 narancs | – |
| `auto-busz` | Vagy autóval megyünk, vagy busszal. Autóval nem megyünk. Mivel megyünk? | 🚌 busz | – |
| `hegedu-szaxofon` | A maci vagy hegedül, vagy szaxofonozik. Szaxofonozni nem fog. Min játszik? | 🎻 hegedű | 🧸 maci |
| `dinnye-ananasz` | Vagy dinnyét vágunk fel, vagy ananászt. Ananászt nem vágunk fel. Mit vágunk fel? | 🍉 dinnye | – |

## Rímpárok (Hangoló plusz)

Rím = a szó vége (az utolsó magánhangzótól, rövid szónál az utolsó szótagtól) ugyanúgy hangzik. Az egy magánhangzós egyezés (pl. kutya–cica: mindkettő -a) NEM rím.

| Egyik | Másik |
|---|---|
| ✋ kéz | 🍯 méz |
| ☀️ nap | 👒 kalap |
| 🐁 egér | 🍞 kenyér |
| 🧣 sál | 🥄 kanál |
| 🦊 róka | 🍭 nyalóka |
| 🐑 bárány | 🌈 szivárvány |
| ☂️ esernyő | 🌲 fenyő |
| 🥒 uborka | 🍬 cukorka |
| 🐦 madár | 🎸 gitár |
| 🍇 szőlő | ✈️ repülő |
| 🐎 ló | ✂️ olló |

**Bizonytalanok (most nem használjuk):**

- 🐍 kígyó – 🐛 hernyó: [ELLENŐRIZNI] -gyó / -nyó: hasonló, de nem azonos; inkább csengés, mint rím
- 🚪 ajtó – 🚗 autó: [ELLENŐRIZNI] jó rím, de az „autó” szótagszáma (au) bizonytalan, ezért a Hangoló plusz nem használja

*11 pár kevés a változatossághoz: ha eszedbe jut még rímelő képpár (akár új képpel), írd meg.*
