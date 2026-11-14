// Szervizmunkás (service worker) regisztrálása és az új verzió telepítése.
// Az új verzió letöltése háttérben megy; ÁTVÁLTANI csak akkor váltunk, ha a gyerek nincs lap közben
// (kezdőlap vagy lapválasztó látszik), így soha nem szakad félbe egy feladat.
import { registerSW } from 'virtual:pwa-register';

let pendingUpdate = false;
let applyUpdate: ((reload?: boolean) => Promise<void>) | null = null;
let canSwitchNow: () => boolean = () => true;

export function setupPwa(canSwitch: () => boolean): void {
  canSwitchNow = canSwitch;
  try {
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
  if (pendingUpdate && applyUpdate && canSwitchNow()) {
    pendingUpdate = false;
    void applyUpdate(true);
  }
}
