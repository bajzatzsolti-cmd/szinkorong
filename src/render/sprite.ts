// A szókincs-képek (OpenMoji, módosítva) egyetlen SVG-sprite-ban vannak, a build tartalmazza (offline).
// Egyszer beillesztjük a dokumentumba; a képek <use href="#w-<id>"> hivatkozással jelennek meg.
import sprite from '../assets/sprite/openmoji.svg?raw';

export function installSprite(): void {
  if (document.getElementById('sprite-root')) return;
  const holder = document.createElement('div');
  holder.id = 'sprite-root';
  holder.setAttribute('aria-hidden', 'true');
  holder.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
  holder.innerHTML = sprite;
  document.body.prepend(holder);
}

/** Csak teszteléshez: a sprite szövege. */
export const SPRITE_SOURCE: string = sprite;
