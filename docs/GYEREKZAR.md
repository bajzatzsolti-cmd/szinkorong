# Gyerekzár: mit old meg a kód, és mit az iPad

## Amit a Színkorong maga megold

| Védelem | Hogyan |
|---|---|
| Nagyítás tiltása | `user-scalable=no` a viewport metában, `touch-action: none` a CSS-ben, a `gesturestart`/`gesturechange` események letiltása, többujjas érintés megfogása |
| Dupla koppintás nem nagyít | `touch-action: none`, plusz a `dblclick` letiltása |
| Nincs szövegkijelölés | `user-select: none`, `selectstart` letiltva |
| Nincs hosszú nyomásra felugró menü | `-webkit-touch-callout: none`, `contextmenu` letiltva |
| Nincs képmentés / húzás | az ábrák beágyazott SVG-k (nem `<img>`), `dragstart` letiltva |
| A lap nem görgethet, nem „gumizik” | `position: fixed`, `overflow: hidden`, `overscroll-behavior: none`, `touchmove` letiltva |
| Nincs kifelé mutató link | egyetlen `<a href>` sincs az appban (teszt ellenőrzi) |
| Nincs „vissza” lépés | az app nem használ böngészőelőzményt (history) |
| Szülői funkciók elrejtve | haladás törlése, hangerő, témakörök ki/be: a jobb oldali sarokban lévő halvány fogaskerék, **3 másodperces hosszú nyomás** mögött |

> A `user-scalable=no` iOS Safarin önmagában nem hatásos (az Apple 2016 óta figyelmen kívül hagyja),
> ezért a tényleges tiltás a `touch-action` és a gesztusesemények letiltása. Ezt valódi iPaden a 6. sprintben ellenőrizzük.

## Amit a kód nem tud megoldani: Irányított hozzáférés (Guided Access)

A **kilépést** az app nem tudja letiltani: a Home-csúsztatást (felfelé a képernyő aljáról), az értesítéseket, a Vezérlőközpontot
és az appváltót az iPadOS kezeli. Erre való az **Irányított hozzáférés**, amely az iPadet egyetlen appba zárja, amíg a szülő
jelkóddal ki nem lép.

### Bekapcsolás (egyszer)

1. **Beállítások → Kisegítő lehetőségek → Irányított hozzáférés** (Guided Access) → kapcsold **be**.
2. **Jelkód beállításai → Irányított hozzáférés jelkódjának beállítása**: válassz egy jelkódot, amit a gyerek nem ismer.
   (Opcionális: Touch ID-val is feloldható.)
3. Opcionális: **Időkorlát hangjelzése** és **Kijelző automatikus zárolása** (a lejárat is beállítható a munkamenet indításakor).

### Használat (minden játék előtt)

1. Indítsd el a Színkorong appot a Főképernyőről.
2. Nyomd meg **háromszor gyorsan a felső gombot** (iPad mini 6: a felső, be/ki gomb).
3. Az **Irányított hozzáférés** képernyőn koppints az **Opciók** gombra:
   - **Érintés:** maradjon bekapcsolva (különben a gyerek nem tud játszani).
   - **Mozgás:** kikapcsolható.
   - **Időkorlát:** beállíthatod, mennyi ideig játszhat.
4. Koppints a **Kezdés** gombra.

### Kilépés (szülőként)

1. Nyomd meg **háromszor a felső gombot**, és add meg a jelkódot (vagy Touch ID).
2. Koppints a **Vége** gombra.

### Mit zár le az Irányított hozzáférés?

- A Home-csúsztatás és az appváltó nem működik.
- Az értesítések és a Vezérlőközpont nem jelennek meg.
- A felső gombbal kikapcsolt képernyő után jelkód kell a folytatáshoz.

A menüpontok neve az iPadOS-verziótól függően kissé eltérhet.

## Szülői menü

A Színkorong szülői menüje (jobb sarok, 3 másodperc nyomás) az **app** funkcióit tartalmazza (hangerő, témakörök, haladás törlése).
Ez nem azonos az iPad Irányított hozzáférésével, és nem helyettesíti azt.
