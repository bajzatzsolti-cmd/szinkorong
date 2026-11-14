// Hangfeldolgozás függőség nélkül: nyers 16 bites PCM → csendvágás, hangerő-egységesítés, WAV.
// A hangscriptek közös utómunkája: így minden klip elején-végén ugyanannyi csend van, és egyformán hangos.

/** 16 bites, előjeles, little-endian mono PCM → Float32 (-1..1). */
export function pcm16ToFloat(buf) {
  const n = Math.floor(buf.length / 2);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = buf.readInt16LE(i * 2) / 32768;
  return out;
}

export function floatToPcm16(samples) {
  const buf = Buffer.alloc(samples.length * 2);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE(Math.round(s * 32767), i * 2);
  }
  return buf;
}

const db = (x) => 20 * Math.log10(Math.max(x, 1e-9));
const undb = (d) => 10 ** (d / 20);

/** 10 ms-os ablakok RMS-e. */
function frameRms(samples, rate) {
  const size = Math.max(1, Math.round(rate * 0.01));
  const frames = [];
  for (let i = 0; i < samples.length; i += size) {
    let s = 0;
    const end = Math.min(samples.length, i + size);
    for (let j = i; j < end; j++) s += samples[j] * samples[j];
    frames.push(Math.sqrt(s / (end - i)));
  }
  return { frames, size };
}

/**
 * Csendvágás és hangerő-egységesítés.
 *  • vágás: a legerősebb ablakhoz képest -40 dB alatti (de legalább -50 dBFS alatti) részek az elején és a végén;
 *    előtte 60 ms, utána 150 ms csend marad, 10 ms-os be- és kiúsztatással;
 *  • hangerő: a beszédes ablakok átlagos RMS-e -20 dBFS legyen, a csúcs legfeljebb -1 dBFS.
 */
export function trimAndNormalize(samples, rate, { targetRmsDb = -20, peakDb = -1, padStartMs = 60, padEndMs = 150 } = {}) {
  const { frames, size } = frameRms(samples, rate);
  const loudest = Math.max(...frames);
  const threshold = Math.max(undb(-50), loudest * undb(-40));
  let first = frames.findIndex((f) => f > threshold);
  let last = frames.length - 1 - [...frames].reverse().findIndex((f) => f > threshold);
  if (first < 0) return { samples: new Float32Array(0), stats: { empty: true } };
  const start = Math.max(0, first * size - Math.round((rate * padStartMs) / 1000));
  const end = Math.min(samples.length, (last + 1) * size + Math.round((rate * padEndMs) / 1000));
  const out = samples.slice(start, end);

  // Hangerő: csak a beszédes ablakokból számolva (a szünetek ne húzzák le az átlagot).
  let sum = 0;
  let count = 0;
  for (let f = first; f <= last; f++) {
    if (frames[f] > threshold) {
      sum += frames[f] * frames[f];
      count++;
    }
  }
  const rms = Math.sqrt(sum / Math.max(1, count));
  let peak = 0;
  for (const s of out) peak = Math.max(peak, Math.abs(s));
  const gain = Math.min(undb(targetRmsDb) / Math.max(rms, 1e-9), undb(peakDb) / Math.max(peak, 1e-9));
  for (let i = 0; i < out.length; i++) out[i] *= gain;

  // Be- és kiúsztatás (kattanás ellen).
  const fade = Math.min(Math.round(rate * 0.01), Math.floor(out.length / 2));
  for (let i = 0; i < fade; i++) {
    out[i] *= i / fade;
    out[out.length - 1 - i] *= i / fade;
  }
  return {
    samples: out,
    stats: { durationS: out.length / rate, rmsDb: db(rms * gain), peakDb: db(peak * gain), gainDb: db(gain) },
  };
}

export function silence(rate, seconds) {
  return new Float32Array(Math.round(rate * seconds));
}

export function concat(parts) {
  const total = parts.reduce((s, p) => s + p.length, 0);
  const out = new Float32Array(total);
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

/** Mono 16 bites WAV fájl tartalma. */
export function wav(samples, rate) {
  const data = floatToPcm16(samples);
  const h = Buffer.alloc(44);
  h.write('RIFF', 0);
  h.writeUInt32LE(36 + data.length, 4);
  h.write('WAVE', 8);
  h.write('fmt ', 12);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(1, 22);
  h.writeUInt32LE(rate, 24);
  h.writeUInt32LE(rate * 2, 28);
  h.writeUInt16LE(2, 32);
  h.writeUInt16LE(16, 34);
  h.write('data', 36);
  h.writeUInt32LE(data.length, 40);
  return Buffer.concat([h, data]);
}
