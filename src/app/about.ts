// Névjegy (szülői menü): forrásmegjelölések, licencek, adatvédelem. Szöveg csak itt, a szülőnek.
// Kifelé mutató link nincs (gyerekzár): a címek csak szövegként szerepelnek.

export function renderAbout(card: HTMLElement, back: () => void): void {
  const version = typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : '';
  card.innerHTML =
    `<h2>Névjegy</h2>` +
    `<p class="pnote">Színkorong ${version}. Iskolára hangoló logikai és készségfejlesztő játék, családi használatra.</p>` +
    `<div class="psec">Képek</div>` +
    `<p class="ptext">All emojis designed by OpenMoji – the open-source emoji and icon project (openmoji.org). ` +
    `Licenc: CC BY-SA 4.0 (creativecommons.org/licenses/by-sa/4.0). A rajzokat egy közös fájlba gyűjtöttük, és az ` +
    `árnyék-változatok a rajzokból készült sziluettek: ez a módosított változat is CC BY-SA 4.0 licenc alatt áll.</p>` +
    `<p class="ptext">A korongok, az alakzatok, a jelek és a „Hol van?” tárgyai (szék, ágy, doboz, kosár) saját rajzok.</p>` +
    `<div class="psec">Betűtípusok</div>` +
    `<p class="ptext">Nunito és Fredoka, SIL Open Font License 1.1.</p>` +
    `<div class="psec">Hangok</div>` +
    `<p class="ptext">A felolvasás előre legyártott hangfájl: ElevenLabs, „Aggie” hang (Hanggyűjtemény), eleven_v3 modell, ` +
    `fizetős előfizetés alatt generálva, ami kereskedelmi felhasználási jogot ad, a lemondás után is. ` +
    `Ha egy hangfájl hiányzik, a készülék saját magyar hangja olvas fel.</p>` +
    `<div class="psec">Adatvédelem</div>` +
    `<p class="ptext">Nincs fiók, e-mail, jelszó, valódi név, életkor vagy fénykép; nincs elemzőkód, nincs hirdetés, ` +
    `nincs ranglista, és senki nem látja, ki játszik még. A játék az első letöltés után internet nélkül is működik.</p>` +
    `<p class="ptext"><b>Ha nem kapcsolod be a szinkront:</b> a haladás (mely lapok készek) és a beállítások csak ezen a ` +
    `készüléken, a böngésző tárolójában vannak; semmi nem megy ki az internetre.</p>` +
    `<p class="ptext"><b>Ha bekapcsolod a szinkront</b> (Játékosok → játékosnév + 4 jegyű szülői kód): a készülék a ` +
    `játékosnévből és a kódból egy lenyomatot (azonosítót) számol; a nevet és a kódot nem küldi el. A szerverre csak ez ` +
    `kerül: a lenyomat (a szerver még egyszer, titkos kulccsal lenyomatolja), a kész lapok listája, a szülői beállítások ` +
    `(hangerő, kikapcsolt témakörök), a látott bemutatók és az utolsó módosítás ideje. A tárhely a Cloudflare ` +
    `szolgáltatása, EU-s adattárolással. Kérésnaplót nem vezetünk; a Cloudflare a kérés kiszolgálása közben ` +
    `átmenetileg látja az IP-címet [ELLENŐRIZNI: a Cloudflare adatkezelési feltételei].</p>` +
    `<p class="ptext"><b>Törlés:</b> Játékosok → „Játékos törlése”: törli a készülékről és a szerverről is; a szerveren ` +
    `ezután nem marad adat. [ELLENŐRIZNI: a lenyomatolt azonosító és a haladás személyes adatnak minősül-e a GDPR ` +
    `szerint; gyermek játékáról van szó; kell-e adatkezelési tájékoztató más családok számára.]</p>` +
    `<div class="pfoot"><span></span><button class="pbtn primary" data-act="about-back">Vissza</button></div>`;
  card.onclick = (e) => {
    if ((e.target as HTMLElement).closest('[data-act="about-back"]')) back();
  };
}
