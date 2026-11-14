// Képernyők közti váltás. Nincs böngészőelőzmény (history): a gyerek nem tud „visszalépni”
// véletlenül egy másik oldalra, és a hash-útvonalakra sincs szükség egy ilyen kis appban.
import { getTopic } from '../topics';
import type { Cleanup, Nav } from './dom';
import { mountHome } from './home-screen';
import { mountMap } from './map-screen';
import { mountSheet } from './sheet-screen';

export type ScreenName = 'home' | 'map' | 'sheet';

export interface App {
  nav: Nav;
  current(): ScreenName;
  refresh(): void;
}

export function createApp(root: HTMLElement, onSafeScreen: () => void): App {
  let cleanup: Cleanup = () => undefined;
  let screen: ScreenName = 'home';
  let rerender: () => void = () => undefined;

  const show = (name: ScreenName, mount: () => Cleanup): void => {
    cleanup();
    screen = name;
    rerender = () => show(name, mount);
    cleanup = mount();
    root.dataset.screen = name;
    // Kezdőlapon és lapválasztón biztonságos új verzióra váltani; lap közben nem.
    if (name !== 'sheet') onSafeScreen();
  };

  const nav: Nav = {
    home: () => show('home', () => mountHome(root, nav)),
    map: (topicId) => {
      getTopic(topicId);
      show('map', () => mountMap(root, topicId, nav));
    },
    sheet: (topicId, index) => show('sheet', () => mountSheet(root, topicId, index, nav)),
    demo: (topicId, thenIndex) => show('sheet', () => mountSheet(root, topicId, thenIndex, nav, true)),
  };

  return {
    nav,
    current: () => screen,
    refresh: () => rerender(),
  };
}
