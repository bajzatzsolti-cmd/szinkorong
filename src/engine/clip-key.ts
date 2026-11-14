// A hangfájlok neve a felolvasott szöveg lenyomata: ugyanaz a mondat = ugyanaz a fájl, akárhány azonosító
// hivatkozik rá. A fájl szándékosan importmentes, hogy a Node közvetlenül is futtathassa
// (scripts/hang-generalas.mjs ugyanezt a függvényt használja, mint a játék).

/** FNV-1a 32 bites lenyomat, 8 hexa számjeggyel. */
export function clipKey(text: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}
