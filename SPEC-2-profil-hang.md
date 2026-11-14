# Színkorong – kiegészítő prompt: játékosprofil + ElevenLabs hangok

Ezt akkor add oda a Claude Code-nak, amikor az alapjáték (SPEC.md szerinti sprintek) már működik. Tedd a repóba `SPEC-2-profil-hang.md` néven, és kérd: „Olvasd el, és először csak tervet adj."

---

## A) Játékosprofil és készülékek közti szinkron

### Cél
A gyerek (pontosabban a szülő) egyszer beír egy játékosnevet, például `Laruska22`. Ha másik készüléken ugyanezt beírja, ott folytatja, ahol abbahagyta. A játékot más óvodás családok is megkaphatják linken, ők a saját játékosnevükkel játszanak. Cél a folytonosság, nem a nyilvántartás.

### Alapelvek (ezekből ne engedj)
- **Nincs személyes adat.** Nincs e-mail, jelszó, valódi név, életkor, óvoda, fotó. A beviteli mezőnél rövid figyelmeztetés: „Becenevet és számot írj, ne teljes nevet."
- **Nincs lista a játékosokról.** Senki nem látja, ki játszik még, nincs ranglista, nincs statisztika, nincs elemzőkód (analytics).
- **A szerver csak ennyit tárol:** a játékosnév normalizált alakjából képzett azonosító (hash), a haladás (mely lapok kész), a szülői beállítások, utolsó módosítás ideje. Semmi mást.
- **Offline az elsődleges.** A haladás továbbra is a készüléken él; a szinkron csak akkor fut, ha van net. Net nélkül a játék ugyanúgy működik.
- **Haladás nem veszhet el.** Összefésülésnél a két készülék kész lapjainak **uniója** marad meg, soha nem felülírás.

### Működés
- Első indításkor (és a szülői menüből): „Játékosnév" mező, 3–20 karakter, betű + legalább 2 számjegy. Kis- és nagybetű, ékezet nem számít az azonosításnál.
- Ha a név már létezik a szerveren: „Ez a játékos már játszott. Folytatod?" – igen esetén letölti és összefésüli a haladást.
- Egy készüléken több profil is lehet (testvér, vendég); váltás csak a szülői menüből (hosszú nyomás mögött).
- „Profil törlése" a szülői menüben: törli a készülékről és a szerverről is.
- Profil nélkül is lehessen játszani („csak ezen a készüléken").

### Technika
- Tegyél javaslatot a háttérre, és hasonlítsd össze röviden: **Cloudflare Workers + KV/D1** és **Supabase** (vagy ami szerinted jobb). Szempontok: ingyenes csomagban elfér-e néhány tucat játékos, EU-s adattárolás lehetősége, mennyi a beállítási munka egy nem fejlesztőnek, hogyan illeszkedik a statikus tárhelyhez.
- Egyetlen egyszerű API: haladás lekérése és mentése azonosító alapján. Bemenet ellenőrzése, méretkorlát, kérésszám-korlát (rate limit), CORS csak a játék saját címéről.
- API-kulcs, titok nem kerülhet a repóba és a kliens kódba.
- Írd le lépésenként, mit kell nekem kattintanom a szolgáltatónál.

### Kockázatok, amelyekre megoldást kérek
- **Kitalálható név:** aki beírja más játékosnevét, látja és módosíthatja a haladását. Javasolj arányos védelmet (pl. opcionális 4 jegyű szülői kód, vagy generált, nehezen kitalálható utótag), de a belépés maradjon egyszerű.
- **Ütközés:** két család ugyanazt a nevet választja – hogyan jelezzük érthetően?
- **Adatvédelem:** írj egy rövid, közérthető magyar tájékoztatót a szülői menübe arról, hogy mit tárolunk és mit nem, és hogyan törölhető. Jelöld `[ELLENŐRIZNI]` címkével, amit jogilag érdemes átnézetni.
- **Megosztás miatt:** ellenőrizd, hogy minden beépített kép, betűtípus és hang licence megengedi a nyilvános terjesztést; a szükséges forrásmegjelöléseket tedd a szülői menü „Névjegy" oldalára.

### Elfogadási feltételek
- Két készüléken ugyanazzal a játékosnévvel a kész lapok mindkét irányban megjelennek.
- Repülő módban játszva, majd netre visszatérve a haladás feltöltődik, semmi nem vész el.
- A hálózati forgalomban a haladáson és az azonosítón kívül semmi nem megy ki.
- Profil törlése után a szerveren nem marad adat.

---

## B) Hangok cseréje ElevenLabs-re

### Kiinduló helyzet
- Van **ElevenLabs Starter** előfizetésem: **havi 30 000 kredit**, kereskedelmi licenccel. Az előfizetést egy hónapra tervezem, ezért a teljes hanganyagnak ebben a hónapban el kell készülnie.
- Az ElevenLabs-fiókom **connectorral (MCP) össze van kötve a Claude-dal.** Először ellenőrizd, hogy ebben a munkamenetben eléred-e az ElevenLabs eszközöket (hangok listázása, beszéd generálása, kreditegyenleg lekérdezése), és írd meg, mit látsz.

### Cél
A gépi, robotos hang helyett természetes magyar hang minden felolvasásnál. A hangok előre legenerált fájlok a repóban; a játék futás közben nem hív külső szolgáltatást.

### Kreditkeret (ne lépd túl jóváhagyás nélkül)
| Szakasz | Keret |
|---|---|
| Hangválasztás, próbaklipek | legfeljebb 1 000 kredit |
| Teljes anyag első generálása | kb. 8 000 kredit (a manifest alapján pontosítsd) |
| Javítás, újragenerálás | legfeljebb 10 000 kredit |
| Tartalék (bővítés, betűíró játék) | a maradék, ehhez ne nyúlj |

Minden generálás előtt kérdezd le az egyenleget, írd ki a várható felhasználást, és **várd meg a jóváhagyásomat**. Ha egy szakasz a keretét elérné, állj meg és szólj.

### Munkamenet
1. **Hangválasztás (connectorral, ha elérhető).** Listázd a magyarul jól szóló hangokat, javasolj 3 meleg, nyugodt, gyerekbarát „mesélő" hangot. Mindegyikkel generáld le ugyanazt a rövid próbasort, és add oda meghallgatásra:
   - „Számold meg! Hol van ugyanannyi?"
   - „Mondd ki hangosan a kép nevét! Melyik kezdődik ugyanazzal a hanggal?"
   - „Ügyes vagy!"
   - „A cica a szék alatt van."
   - egyszavas klipek: „alma", „cseresznye", „gyűrű", „zsiráf", „tyúk"
2. **Modell és beállítások.** Ellenőrizd az aktuális ElevenLabs dokumentációban, mely modellek támogatják a magyart és mennyi kreditet számolnak karakterenként; tegyél javaslatot (minőség az elsődleges, a mennyiség kicsi). A választott hang azonosítóját, a modellt és a beállításokat rögzítsd egy `audio/hang-beallitas.json` fájlban.
3. **Próbakör a játékban.** Mielőtt mindent legenerálsz: 20 klip bekötve, iPaden meghallgatva. Csak a jóváhagyásom után jöhet a teljes kör.
4. **Teljes generálás – reprodukálható módon.** A tömeges generálás egy `tools/hang-generalas` scriptből fusson az `audio/manifest.json` alapján, hogy később bármikor megismételhető legyen:
   - **Csak a változást generálja újra:** a szöveg + hang + beállítások lenyomata (hash) alapján kihagyja, ami megvan; törli, ami már nem kell.
   - Futtatás előtt kiírja a karakterszámot és a kreditigényt, megerősítést kér.
   - Kimenet: egységes hangerőre normalizált, elején-végén csendtől megvágott, kis méretű mono fájlok.
   - Ha a scripthez API-kulcs kell: környezeti változóból (`.env`, amely nincs a repóban) olvassa. Mondd el lépésenként, hogyan készítek kulcsot (csak szövegfelolvasási joggal, kreditkorláttal). **A kulcsot ne kérd el a chatben, és soha ne írd fájlba, amely a repóba kerül.**
   - Ha a connectorral megbízhatóan és megismételhetően megoldható a tömeges generálás, javasolhatod azt is – indokold, melyik a jobb.

### Minőségi buktatók
- **Egyszavas klipek** (képnevek) hajlamosak furcsa hangsúlyra: próbáld ki, mi ad természetes eredményt (pl. írásjel, környezeti mondatból kivágás), és dokumentáld a bevált módszert.
- **Betűk hangjai** (pl. „m", „sz", „gy" hangoztatva, nem betűnévvel): gépi hanggal gyakran rosszak. Készíts külön listát róluk, és adj lehetőséget arra, hogy ezeket **saját felvétellel** cseréljem le (egyszerű felvevő oldal a szülői menüben, vagy fájlok bemásolása megadott névvel).
- **Hangpróba oldal** (csak szülői/fejlesztői): minden klip listázva, lejátszás gombbal, „rossz" jelöléssel; a megjelölteket a script más beállítással újragenerálja.
- Ha egy klip hiányzik, a játék ne álljon meg: tartalék a készülék saját magyar hangja.

### Licenc
- Ellenőrizd az ElevenLabs aktuális feltételeiben, és írd le röviden: a Starter csomaggal generált hangok megoszthatók-e nyilvános, ingyenes játékban, és **megmaradnak-e a felhasználási jogok az előfizetés lemondása után**. Amit nem tudsz egyértelműen megerősíteni, jelöld `[ELLENŐRIZNI]` címkével.

### Elfogadási feltételek
- Minden a manifestben szereplő szöveghez van hangfájl, a teszt ezt ellenőrzi.
- A játék offline is minden hangot lejátszik.
- A build végén ki van írva a teljes hangcsomag mérete, a zárójelentésben pedig a felhasznált és a megmaradt kredit.
