import './styles/fonts.css';
import './styles/app.css';

import { createApp } from './app/app';
import { installParentButton } from './app/parent';
import { setVolume, unlockAudio } from './engine/audio';
import { installChildLock } from './engine/lock';
import { isFirstLaunch } from './engine/profiles';
import { getSettings } from './engine/progress';
import { setupSync } from './engine/sync';
import { showWelcome } from './app/profile-ui';
import { setupPwa, tryApplyUpdate } from './pwa';
import { installSprite } from './render/sprite';

const root = document.getElementById('app');
if (!root) throw new Error('Hiányzik a #app elem.');

installChildLock();
installSprite();
const firstLaunch = isFirstLaunch();
setVolume(getSettings().volume);
setupSync();

// iOS-en hang csak érintés után indulhat: az első koppintáskor feloldjuk.
document.addEventListener('pointerdown', () => unlockAudio(), { once: true, capture: true });

const app = createApp(root, tryApplyUpdate);
installParentButton(() => app.refresh());
setupPwa(() => app.current() !== 'sheet');
app.nav.home();
if (firstLaunch) showWelcome();
