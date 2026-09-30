// Single bundled entry: every module is a no-op when its elements are absent.
import { initSequences } from './sequences';
import { initReveal } from './reveal';
import { initCountdown } from './countdown';
import { initFab } from './fab';
import { initNav } from './nav';
import { initForm } from './form';
import { initAnalytics, wireDataEvents } from '../lib/analytics';

document.documentElement.classList.add('js-ready');
initReveal();
initSequences();
initCountdown();
initFab();
initNav();
initForm();
wireDataEvents();
initAnalytics();
