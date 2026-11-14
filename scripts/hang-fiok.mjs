// ElevenLabs-fiók állapota, csak olvas (kreditet NEM fogyaszt):  npm run hang:fiok
// Kiírja: a kulcs működik-e, a csomagot és a krediteket, a fiók hangjait, és a Hanggyűjtemény
// magyar hangjait (jelöltek a hangválasztáshoz).
import { balance, client, ElevenLabsError } from './lib/elevenlabs.mjs';

const api = client();

const b = await balance(api);
if (b.error) console.log(`Kredit: nem kérdezhető le (${b.error}). Ehhez a kulcsnak „User: Read” jog kell.`);
else
  console.log(
    `Csomag: ${b.tier} · felhasznált: ${b.used} / ${b.limit} kredit · maradt: ${b.remaining}` +
      (b.resetAt ? ` · újraindul: ${b.resetAt.toISOString().slice(0, 10)}` : ''),
  );

try {
  const { voices } = await api.get('/v2/voices?page_size=100');
  console.log(`\nA fiók hangjai (${voices.length}):`);
  for (const v of voices) {
    const l = v.labels ?? {};
    const tags = [v.category, l.gender, l.age, l.accent, l.language, l.use_case || l['use case'], l.description].filter(Boolean).join(', ');
    console.log(`  ${v.name} — ${v.voice_id} — ${tags}`);
  }
} catch (e) {
  console.log(`\nA fiók hangjai: nem listázható (${e instanceof ElevenLabsError ? e.status + ' ' + JSON.stringify(e.detail) : e}).`);
}

try {
  const q = new URLSearchParams({ language: 'hu', page_size: '40', sort: 'usage_character_count_1y' });
  const { voices } = await api.get(`/v1/shared-voices?${q}`);
  console.log(`\nHanggyűjtemény, magyar (${voices.length}):`);
  for (const v of voices) {
    const tags = [v.gender, v.age, v.accent, v.use_case, v.descriptive, v.category].filter(Boolean).join(', ');
    console.log(`  ${v.name} — ${v.voice_id} (tulaj: ${v.public_owner_id}) — ${tags} — használat/év: ${v.usage_character_count_1y ?? '?'}`);
  }
} catch (e) {
  console.log(`\nHanggyűjtemény: nem kérdezhető le (${e instanceof ElevenLabsError ? e.status + ' ' + JSON.stringify(e.detail) : e}).`);
}
