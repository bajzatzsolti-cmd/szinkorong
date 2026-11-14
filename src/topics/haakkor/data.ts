// A „Ha–akkor” kézi tartalma (content/haakkor.json): a hallott rövid következtetések és megoldásaik.
import raw from '../../../content/haakkor.json' with { type: 'json' };

export interface Item {
  id: string;
  /** 1–3 (a lap szintje + 1). */
  szint: number;
  /** Amit a gyerek hall. */
  szoveg: string;
  /** A megoldás képe (szókincs-azonosító). */
  valasz: string;
  /** Képek, amelyek szintén illenének, vagy elhangzanak a szövegben: nem lehetnek megoldások ugyanazon a lapon. */
  utkozik: string[];
}

export const ITEMS: readonly Item[] = (raw as unknown as { feladatok: Item[] }).feladatok;
export const ITEM_BY_ID: ReadonlyMap<string, Item> = new Map(ITEMS.map((i) => [i.id, i]));
/** A feladat hangja (content/audio/manifest.json). */
export const sayOf = (id: string): string => `haakkor-${id}`;
