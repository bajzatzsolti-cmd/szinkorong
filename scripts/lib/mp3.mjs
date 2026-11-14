// MP3-kódolás tiszta JavaScripttel (@breezystack/lamejs, csak fejlesztői függőség: a játékba nem kerül).
import { floatToPcm16 } from './audio-dsp.mjs';

let Encoder = null;

async function encoderClass() {
  if (Encoder) return Encoder;
  try {
    const m = await import('@breezystack/lamejs');
    Encoder = m.Mp3Encoder ?? m.default?.Mp3Encoder;
  } catch {
    throw new Error(
      'Hiányzik az MP3-kódoló. Telepítsd a projektmappában (PowerShell):\n' +
        '  cd C:\\dev\\szinkorong; $env:Path = "C:\\dev\\szinkorong\\.tools\\node;" + $env:Path; npm.cmd install --save-dev @breezystack/lamejs@1.2.7',
    );
  }
  return Encoder;
}

/** Generálás ELŐTT hívandó: ha nincs kódoló, egyetlen kredit se menjen el feleslegesen. */
export async function ensureEncoder() {
  await encoderClass();
}

/** Mono Float32 minták → MP3 bájtok. */
export async function encodeMp3(samples, rate, kbps) {
  const E = await encoderClass();
  const enc = new E(1, rate, kbps);
  const pcm = floatToPcm16(samples);
  const ints = new Int16Array(pcm.buffer, pcm.byteOffset, pcm.length / 2);
  const chunks = [];
  const BLOCK = 1152 * 8;
  for (let i = 0; i < ints.length; i += BLOCK) {
    const out = enc.encodeBuffer(ints.subarray(i, i + BLOCK));
    if (out.length) chunks.push(Buffer.from(out.buffer, out.byteOffset, out.length));
  }
  const tail = enc.flush();
  if (tail.length) chunks.push(Buffer.from(tail.buffer, tail.byteOffset, tail.length));
  return Buffer.concat(chunks);
}
