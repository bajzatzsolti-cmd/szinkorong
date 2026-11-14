// Mozgatás „FLIP” módszerrel: az elem átkerül a DOM új helyére, de vizuálisan onnan csúszik be,
// ahol az előbb volt. Így a korong sima mozgással pattan a helyére (a húzás után is, a tálcára visszamenet is).

export function moveWithFlip(el: HTMLElement, reparent: () => void, animate = true, duration = 170): void {
  const first = el.getBoundingClientRect();
  el.style.transform = '';
  el.classList.remove('dragging');
  reparent();
  if (!animate || typeof el.animate !== 'function') return;
  const last = el.getBoundingClientRect();
  if (last.width === 0 || last.height === 0) return;
  const dx = first.left + first.width / 2 - (last.left + last.width / 2);
  const dy = first.top + first.height / 2 - (last.top + last.height / 2);
  const s = first.width / last.width;
  if (Math.abs(dx) < 1 && Math.abs(dy) < 1 && Math.abs(s - 1) < 0.02) return;
  el.classList.add('flying');
  const anim = el.animate(
    [{ transform: `translate(${dx}px, ${dy}px) scale(${s})` }, { transform: 'translate(0, 0) scale(1)' }],
    { duration, easing: 'cubic-bezier(.2,.8,.3,1)' },
  );
  const done = (): void => el.classList.remove('flying');
  anim.addEventListener('finish', done);
  anim.addEventListener('cancel', done);
}
