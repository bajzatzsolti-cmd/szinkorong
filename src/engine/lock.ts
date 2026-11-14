// „Gyerekzár” a kódban: nagyítás, kijelölés, helyi menü, húzás-gumizás tiltása.
// Fontos: iOS Safari 10 óta figyelmen kívül hagyja a user-scalable=no beállítást, ezért a tényleges
// tiltás a touch-action (CSS), a gesture* események és a többujjas érintés megfogása.
// A kilépést (Home-csúsztatás, értesítések) a kód nem tudja letiltani: erre az iPad
// Irányított hozzáférése való (docs/GYEREKZAR.md).

export function installChildLock(): void {
  const stop = (e: Event): void => e.preventDefault();

  // Csípés-nagyítás (iOS Safari gesztusesemények).
  for (const type of ['gesturestart', 'gesturechange', 'gestureend']) {
    document.addEventListener(type, stop, { passive: false });
  }

  // Többujjas érintés és bármilyen oldal-húzás (gumizás, görgetés) megfogása.
  document.addEventListener(
    'touchmove',
    (e) => {
      // Kivétel: a szülői menü hosszabb tartalma görgethető ([data-scroll]).
      if ((e.target as Element | null)?.closest?.('[data-scroll]')) return;
      e.preventDefault();
    },
    { passive: false },
  );
  document.addEventListener(
    'touchstart',
    (e) => {
      if (e.touches.length > 1) e.preventDefault();
    },
    { passive: false },
  );

  // Nincs hosszú nyomásra felugró menü, nincs kijelölés, nincs képmentés / húzás.
  document.addEventListener('contextmenu', stop);
  document.addEventListener('selectstart', stop);
  document.addEventListener('dragstart', stop);
  // Dupla koppintásra sem nagyít (a touch-action: none mellett ez csak biztonsági háló).
  document.addEventListener('dblclick', stop);

  // Billentyűzettel (asztali teszt) sem lehet nagyítani.
  document.addEventListener('wheel', (e) => {
    if (e.ctrlKey) e.preventDefault();
  }, { passive: false });
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && ['+', '-', '=', '0'].includes(e.key)) e.preventDefault();
  });
}
