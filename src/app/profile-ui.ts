// Játékosok (szülői menü) és az első indítás üdvözlő kártyája. Szöveg csak itt, a szülőnek.
// Elvek (SPEC-2, A): nincs személyes adat (becenév + szám, nem teljes név), a név és a kód nem megy ki a hálózatra,
// profil nélkül is lehet játszani, váltani és törölni csak a szülői menüből lehet.
import { codeProblem, nameProblem, profileId } from '../engine/profile-id';
import { LOCAL_ID, activeProfile, createProfile, listProfiles, removeProfile, switchProfile, updateProfile, type ProfileMeta } from '../engine/profiles';
import { importPayload, exportPayload, getSettings } from '../engine/progress';
import { mergePayload } from '../engine/merge';
import { remoteDelete, remoteGet, syncConfigured, syncNow } from '../engine/sync';
import { setVolume } from '../engine/audio';

const esc = (s: string): string => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const time = (ms: number): string => new Date(ms).toLocaleString('hu-HU', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

function status(p: ProfileMeta): string {
  if (!p.sync) return 'csak ezen a készüléken';
  if (p.pending) return 'szinkronizált · feltöltés vár (ha lesz net, megtörténik)';
  return p.lastSync ? `szinkronizált · utoljára: ${time(p.lastSync)}` : 'szinkronizált';
}

const NET_ERROR = 'Most nincs internet, vagy a szerver nem érhető el. Próbáld újra később.';

/** A profilváltás után a profil saját hangereje is érvényes legyen. */
const applyProfileSettings = (): void => setVolume(getSettings().volume);

export function renderPlayers(card: HTMLElement, back: () => void): void {
  const draw = (msg = ''): void => {
    const act = activeProfile();
    const rows = listProfiles()
      .map(
        (p) =>
          `<label class="prow"><input type="radio" name="pprof" value="${p.local}" ${p.local === act.local ? 'checked' : ''}> ` +
          `<span>${esc(p.name)}<small class="pmuted"> · ${status(p)}</small></span></label>`,
      )
      .join('');
    card.innerHTML =
      `<h2>Játékosok</h2>` +
      `<p class="pnote">Most játszik: <b>${esc(act.name)}</b> (${status(act)}).</p>` +
      `<div class="psec">Játékosok ezen a készüléken (váltás)</div>${rows}` +
      (msg ? `<p class="pmsg">${msg}</p>` : '') +
      `<div class="pbar wrap">` +
      `<button class="pbtn" data-act="p-new">Új játékos</button>` +
      (!act.sync && syncConfigured() ? `<button class="pbtn" data-act="p-attach">Szinkron bekapcsolása (más készülékkel)</button>` : '') +
      (act.sync ? `<button class="pbtn" data-act="p-sync">Szinkron most</button>` : '') +
      `<button class="pbtn danger" data-act="p-del">${act.local === LOCAL_ID && !act.sync ? 'Haladás és név törlése' : 'Játékos törlése'}</button>` +
      `</div>` +
      (!syncConfigured() ? `<p class="pnote">A szinkron (más készüléken folytatás) még nincs beállítva; a játékosok ezen a készüléken így is működnek.</p>` : '') +
      `<div class="pfoot"><span></span><button class="pbtn primary" data-act="p-back">Vissza</button></div>`;
  };

  const form = (mode: 'new' | 'attach', msg = ''): void => {
    const sync = mode === 'attach';
    card.innerHTML =
      `<h2>${mode === 'new' ? 'Új játékos' : 'Szinkron bekapcsolása'}</h2>` +
      `<p class="pnote">Becenevet és számot írj (pl. Laruska22), ne teljes nevet. A név és a kód nem kerül fel az internetre: ` +
      `a játék csak a lenyomatukat küldi el.</p>` +
      `<label class="prow col">Játékosnév<input class="pinput" data-f="name" maxlength="20" autocomplete="off" autocapitalize="off" spellcheck="false" value="${mode === 'attach' && activeProfile().local !== LOCAL_ID ? esc(activeProfile().name) : ''}"></label>` +
      (mode === 'new' && syncConfigured()
        ? `<label class="prow"><input type="checkbox" data-f="sync"> Szinkron más készülékekkel (4 jegyű szülői kód kell)</label>`
        : '') +
      `<label class="prow col pcode"${sync || mode === 'new' ? '' : ' hidden'}>Szülői kód (4 számjegy; ezzel lehet más készüléken folytatni)` +
      `<input class="pinput" data-f="code" inputmode="numeric" maxlength="4" autocomplete="off"></label>` +
      (msg ? `<p class="pmsg">${msg}</p>` : '') +
      `<div class="pbar"><button class="pbtn" data-act="p-cancel">Mégse</button><button class="pbtn primary" data-act="p-save" data-mode="${mode}">Mentés</button></div>`;
    const codeRow = card.querySelector<HTMLElement>('.pcode')!;
    const box = card.querySelector<HTMLInputElement>('[data-f="sync"]');
    if (mode === 'new') {
      codeRow.hidden = !box?.checked;
      box?.addEventListener('change', () => (codeRow.hidden = !box.checked));
    }
  };

  const confirmBox = (text: string, yes: string, onYes: () => void): void => {
    card.innerHTML =
      `<h2>Játékosok</h2><p class="pmsg">${text}</p>` +
      `<div class="pbar"><button class="pbtn" data-act="p-cancel">Mégse</button><button class="pbtn primary" data-act="p-yes">${yes}</button></div>`;
    pendingYes = onYes;
  };
  let pendingYes: (() => void) | null = null;
  let delArmed = false;

  const save = async (mode: 'new' | 'attach'): Promise<void> => {
    const name = card.querySelector<HTMLInputElement>('[data-f="name"]')!.value.trim();
    const wantSync = mode === 'attach' || !!card.querySelector<HTMLInputElement>('[data-f="sync"]')?.checked;
    const code = card.querySelector<HTMLInputElement>('[data-f="code"]')?.value.trim() ?? '';
    const problem = nameProblem(name) ?? (wantSync ? codeProblem(code) : null);
    if (problem) return form(mode, problem);
    if (!wantSync) {
      const p = createProfile(name);
      switchProfile(p.local);
      applyProfileSettings();
      return draw(`Kész: ${esc(name)} játszik (csak ezen a készüléken).`);
    }
    let remote;
    let id: string;
    try {
      id = await profileId(name, code);
      remote = await remoteGet(id);
    } catch {
      return form(mode, NET_ERROR);
    }
    const finish = async (): Promise<void> => {
      if (mode === 'new') {
        const p = createProfile(name, id);
        switchProfile(p.local);
        if (remote) importPayload(remote);
      } else {
        const local = activeProfile().local;
        updateProfile(local, { name, sync: id, pending: true });
        if (remote) importPayload(mergePayload(exportPayload(), remote));
      }
      applyProfileSettings();
      await syncNow();
      draw(remote ? 'Kész: a két készülék haladása összeadódott.' : `Kész: ${esc(name)} mostantól más készüléken is folytathatja.`);
    };
    if (remote) {
      confirmBox(
        'Ezzel a névvel és kóddal már játszottak. Folytatod? A kész lapok összeadódnak, semmi nem vész el. ' +
          '(Ha ez nem a ti játékosotok, válassz másik nevet vagy kódot.)',
        'Igen, folytatom',
        () => void finish(),
      );
    } else {
      confirmBox('Ezzel a névvel és kóddal még nem játszottak: ez egy új játékos lesz. Rendben?', 'Rendben', () => void finish());
    }
  };

  card.onclick = async (e) => {
    const t = e.target as HTMLElement;
    const act = t.closest<HTMLElement>('[data-act]')?.dataset.act;
    if (!act) return;
    if (act === 'p-back') return back();
    if (act === 'p-new') return form('new');
    if (act === 'p-attach') return form('attach');
    if (act === 'p-cancel') return draw();
    if (act === 'p-yes') return pendingYes?.();
    if (act === 'p-save') return void save(t.closest<HTMLElement>('[data-act]')!.dataset.mode as 'new' | 'attach');
    if (act === 'p-sync') {
      await syncNow();
      return draw(activeProfile().pending ? NET_ERROR : 'Kész: szinkronizálva.');
    }
    if (act === 'p-del') {
      const p = activeProfile();
      if (!delArmed) {
        delArmed = true;
        t.textContent = 'Biztosan? A haladás ezen a készüléken' + (p.sync ? ' és a szerveren is' : '') + ' törlődik. Nyomd meg még egyszer.';
        return;
      }
      delArmed = false;
      if (p.sync) {
        try {
          await remoteDelete(p.sync);
        } catch {
          return draw(`${NET_ERROR} A szerverről nem sikerült törölni, ezért a készüléken sem töröltem semmit.`);
        }
      }
      removeProfile(p.local);
      applyProfileSettings();
      return draw('Törölve.');
    }
  };
  card.onchange = (e) => {
    const t = e.target as HTMLInputElement;
    if (t.name === 'pprof') {
      switchProfile(t.value);
      applyProfileSettings();
      void syncNow();
      draw();
    }
  };
  draw();
}

/** Első indítás (új telepítés): egyszeri, kihagyható kártya a játékosnévről. */
export function showWelcome(): void {
  const overlay = document.createElement('div');
  overlay.className = 'pov';
  overlay.dataset.testid = 'welcome';
  overlay.innerHTML =
    `<div class="pcard" data-scroll><h2>Üdv a Színkorongban!</h2>` +
    `<p class="pnote">Ha szeretnéd, adj meg egy játékosnevet. Nem kötelező: enélkül is lehet játszani, a haladás ezen a ` +
    `készüléken marad. Később a szülői menüben (a sarokban lévő fogaskerék, 3 másodpercig nyomva tartva) is beállíthatod.</p>` +
    `<div class="pbar"><button class="pbtn" data-act="w-skip">Most nem, kezdjük</button>` +
    `<button class="pbtn primary" data-act="w-name">Játékosnév megadása</button></div></div>`;
  document.body.append(overlay);
  const close = (): void => {
    updateProfile(LOCAL_ID, {}); // a nyilvántartás mentése: többé nem jelenik meg
    overlay.remove();
  };
  overlay.addEventListener('click', (e) => {
    const act = (e.target as HTMLElement).closest<HTMLElement>('[data-act]')?.dataset.act;
    if (act === 'w-skip') close();
    if (act === 'w-name') {
      updateProfile(LOCAL_ID, {});
      renderPlayers(overlay.querySelector<HTMLElement>('.pcard')!, () => overlay.remove());
      overlay.querySelector<HTMLElement>('[data-act="p-new"]')?.click();
    }
  });
}
