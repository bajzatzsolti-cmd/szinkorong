// Korong húzása Pointer Events-szel: a korong az ujj alatt követi a mozgást, elengedéskor
// a legközelebbi érvényes helyre pattan. Kis mozdulat = koppintás (kijelölés).
import { nearestSlot, type Box } from './snap';

/** Ennyi pixelnél kisebb mozdulat még koppintásnak számít. */
const TAP_SLOP = 8;

export interface DragHooks {
  /** Megfogható-e most a korong (pl. ellenőrzés után nem). */
  canStart(): boolean;
  /** A lehetséges helyek dobozai (képernyő-koordinátában); húzás kezdetén kérjük le. */
  slotBoxes(): Box[];
  /** Ennyi pixelnél közelebb kell lenni egy hely közepéhez, hogy odapattanjon. */
  snapRadius(): number;
  onDragStart(): void;
  /** A húzás közben a korong alatti (legközelebbi) hely, vagy null. */
  onHover(slot: number | null): void;
  /** Elengedéskor. null = érvénytelen hely. A korong ilyenkor még az ujj alatti átalakítással áll. */
  onDrop(slot: number | null): void;
  onTap(): void;
}

export function attachDrag(el: HTMLElement, hooks: DragHooks): void {
  let drag: {
    id: number;
    sx: number;
    sy: number;
    cx: number;
    cy: number;
    moved: boolean;
    boxes: Box[];
    radius: number;
  } | null = null;

  el.addEventListener('pointerdown', (e) => {
    if (drag || !hooks.canStart()) return;
    e.preventDefault();
    try {
      el.setPointerCapture(e.pointerId);
    } catch {
      // egyes böngészők nem engedik; a húzás így is működik
    }
    const r = el.getBoundingClientRect();
    drag = {
      id: e.pointerId,
      sx: e.clientX,
      sy: e.clientY,
      cx: r.left + r.width / 2,
      cy: r.top + r.height / 2,
      moved: false,
      boxes: hooks.slotBoxes(),
      radius: hooks.snapRadius(),
    };
  });

  el.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.sx;
    const dy = e.clientY - drag.sy;
    if (!drag.moved) {
      if (Math.hypot(dx, dy) < TAP_SLOP) return;
      drag.moved = true;
      el.classList.add('dragging');
      hooks.onDragStart();
    }
    el.style.transform = `translate(${dx}px, ${dy}px) scale(1.12)`;
    hooks.onHover(nearestSlot({ x: drag.cx + dx, y: drag.cy + dy }, drag.boxes, drag.radius));
  });

  const finish = (e: PointerEvent, cancelled: boolean): void => {
    if (!drag || e.pointerId !== drag.id) return;
    const d = drag;
    drag = null;
    try {
      el.releasePointerCapture(e.pointerId);
    } catch {
      // nincs teendő
    }
    if (!d.moved) {
      if (!cancelled) hooks.onTap();
      return;
    }
    hooks.onHover(null);
    const slot = cancelled
      ? null
      : nearestSlot({ x: d.cx + (e.clientX - d.sx), y: d.cy + (e.clientY - d.sy) }, d.boxes, d.radius);
    hooks.onDrop(slot);
    // Ha a kezelő nem tette volna, itt tisztítjuk az ideiglenes állapotot.
    el.style.transform = '';
    el.classList.remove('dragging');
  };

  el.addEventListener('pointerup', (e) => finish(e, false));
  el.addEventListener('pointercancel', (e) => finish(e, true));
  // A húzás utáni „click” ne jusson fel a sorra (az onTap/onDrop már kezelte).
  el.addEventListener('click', (e) => e.stopPropagation());
}
