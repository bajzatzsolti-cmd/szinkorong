import { hashString } from '../engine/rng';
import { makeSpec, type Sheet, type TopicId } from '../engine/sheet';
import { analogia } from './analogia';
import { arnyek } from './arnyek';
import { betu } from './betu';
import { csoport } from './csoport';
import { felkep } from './felkep';
import { haakkor } from './haakkor';
import { hangolo } from './hangolo';
import { holvan } from './holvan';
import { kakukk } from './kakukk';
import { kodfejto } from './kodfejto';
import { matrix } from './matrix';
import { merleg } from './merleg';
import { minta } from './minta';
import { par } from './par';
import { sudoku } from './sudoku';
import { tukor } from './tukor';
import type { Topic } from './types';

/** A témakörök jegyzéke (a kezdőlapon ebben a sorrendben). Új témakör = új mappa + egy sor ide. */
export const TOPICS: readonly Topic[] = [
  arnyek, minta, par, csoport, betu, tukor, matrix, analogia, kakukk, sudoku, merleg, felkep, kodfejto, holvan, haakkor, hangolo,
];

export function getTopic(id: TopicId): Topic {
  const t = TOPICS.find((x) => x.id === id);
  if (!t) throw new Error(`Ismeretlen témakör: ${id}`);
  return t;
}

/** A témakör `index`-edik lapja (0..14). Mindig ugyanazt a lapot adja. */
export function buildSheet(topic: Topic, index: number): Sheet {
  return topic.generate(makeSpec(topic.id, index, topic.sizes, topic.contentVersion));
}

/** A témakör bemutató (demo) példalapja: kicsi, könnyű szintű, mindig ugyanaz. */
export function buildDemo(topic: Topic): Sheet {
  if (!topic.demoSize) throw new Error(`Ennek a témakörnek nincs bemutatója: ${topic.id}`);
  return topic.generate({
    topic: topic.id,
    level: 0,
    index: 0,
    n: topic.demoSize,
    seed: hashString(`${topic.id}|demo|v${topic.contentVersion}`),
    demo: true,
  });
}
