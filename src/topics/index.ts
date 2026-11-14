import { makeSpec, type Sheet, type TopicId } from '../engine/sheet';
import { arnyek } from './arnyek';
import { csoport } from './csoport';
import { minta } from './minta';
import { par } from './par';
import type { Topic } from './types';

/** A témakörök jegyzéke (a kezdőlapon ebben a sorrendben). Új témakör = új mappa + egy sor ide. */
export const TOPICS: readonly Topic[] = [arnyek, minta, par, csoport];

export function getTopic(id: TopicId): Topic {
  const t = TOPICS.find((x) => x.id === id);
  if (!t) throw new Error(`Ismeretlen témakör: ${id}`);
  return t;
}

/** A témakör `index`-edik lapja (0..14). Mindig ugyanazt a lapot adja. */
export function buildSheet(topic: Topic, index: number): Sheet {
  return topic.generate(makeSpec(topic.id, index, topic.sizes, topic.contentVersion));
}
