// Szervizmunkás (service worker) regisztrálása és az új verzió telepítése.
// Az új verzió letöltése háttérben megy; ÁTVÁLTANI csak akkor váltunk, ha a gyerek nincs lap közben
// (kezdőlap vagy lapválasztó látszik), így soha nem szakad félbe egy feladat.
//
// Két út vezet az új verzióhoz:
//  1. az új szervizmunkás telepítés után VÁR (ez a szokásos): ekkor jön az onNeedRefresh, és mi kérjük az átváltást;
//  2. az új szervizmunkás várakozás nélkül azonnal átveszi az irányítást (a böngésző néha így tesz, pl. ha a régi
//     lap épp nem volt az övé): ilyenkor csak a „controllerchange” esemény jelzi. A lap ekkor még a régi kódot
//     futtatja, ezért biztonságos pillanatban újratöltjük.
import { registerSW } from 'virtual:pwa-register';

let pendingUpdate = false;
let reloadPending = false;
let selfInitiated = false;
let applyUpdate: ((reload?: boolean) => Promise<void>) | null = null;
let canSwitchNow: () => boolean = () => true;

export function setupPwa(canSwitch: () => boolean): void {
  canSwitchNow = canSwitch;
  try {
    // Az első telepítéskor is jön controllerchange (a szervizmunkás átveszi a lapot), de akkor nincs mit frissíteni.
    const hadController = !!navigator.serviceWorker?.controller;
    navigator.serviceWorker?.addEventListener('controllerchange', () => {
      if (selfInitiated || !hadController) return;
      reloadPending = true;
      tryApplyUpdate();
    });
    applyUpdate = registerSW({
      immediate: true,
      onNeedRefresh() {
        pendingUpdate = true;
        tryApplyUpdate();
      },
      onRegisteredSW(_url, registration) {
        if (!registration) return;
        // iPaden az app ritkán indul újra, inkább a háttérből tér vissza: ilyenkor ellenőrizzük az új verziót.
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') registration.update().catch(() => undefined);
        });
      },
    });
  } catch {
    // Nincs service worker (pl. fejlesztői mód): a játék online-ként is megy.
  }
}

/** Biztonságos pillanatokban (kezdőlapra / lapválasztóra érkezéskor) hívjuk. */
export function tryApplyUpdate(): void {
  if (!canSwitchNow()) return;
  if (pendingUpdate && applyUpdate) {
    pendingUpdate = false;
    selfInitiated = true;
    void applyUpdate(true);
    return;
  }
  if (reloadPending) {
    reloadPending = false;
    window.location.reload();
  }
}
