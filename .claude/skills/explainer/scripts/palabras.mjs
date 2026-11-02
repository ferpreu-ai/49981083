// Convierte una transcripción de Whisper en tiempos por palabra para el explainer.
// Acepta la salida JSON de whisper.cpp (-ojf -ml 1 -sow) y la de openai-whisper (--word_timestamps True).
//
// Uso:
//   node palabras.mjs voz.json                    lista numerada de palabras, para elegir los cortes
//   node palabras.mjs voz.json --cortes 0,18,41   imprime SCRIPT y WORDS listos para pegar
//
// --cortes: índice de la primera palabra de cada escena. El primero siempre es 0.
import { readFileSync } from 'node:fs';

const args = process.argv.slice(2);
const file = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--cortes');
if (!file) { console.error('Uso: node palabras.mjs voz.json [--cortes 0,18,41]'); process.exit(2); }
const data = JSON.parse(readFileSync(file, 'utf8'));
const r2 = x => Math.round(x * 100) / 100;

let words = [];
if (Array.isArray(data.transcription)) {
  // whisper.cpp: cada segmento trae offsets en milisegundos
  for (const s of data.transcription) {
    const w = String(s.text || '').trim();
    if (!w) continue;
    // Con -ml 1, un signo suelto puede quedar como segmento propio: se pega a la palabra anterior
    if (/^[.,:;!?…»"')]+$/.test(w) && words.length) { words[words.length - 1][0] += w; words[words.length - 1][2] = r2(s.offsets.to / 1000); continue; }
    words.push([w, r2(s.offsets.from / 1000), r2(s.offsets.to / 1000)]);
  }
} else if (Array.isArray(data.segments)) {
  // openai-whisper: segmentos con palabras en segundos
  for (const s of data.segments) for (const w of s.words || []) { const t = String(w.word).trim(); if (t) words.push([t, r2(w.start), r2(w.end)]); }
} else {
  console.error('No reconozco el formato. Esperaba "transcription" (whisper.cpp) o "segments" (openai-whisper).');
  process.exit(2);
}
// Las palabras sin espacios internos: el motor cuenta palabras separadas por espacios
words = words.flatMap(([w, s, e]) => {
  const parts = w.split(/\s+/);
  if (parts.length === 1) return [[w, s, e]];
  const d = (e - s) / parts.length;
  return parts.map((p, i) => [p, r2(s + i * d), r2(s + (i + 1) * d)]);
});

const ci = args.indexOf('--cortes');
if (ci < 0) {
  words.forEach(([w, s], i) => console.log(`${String(i).padStart(4)}  ${s.toFixed(2).padStart(7)}  ${w}`));
  console.log(`\n${words.length} palabras. Elegí el índice de la primera palabra de cada escena y corré de nuevo con --cortes.`);
  process.exit(0);
}
const cuts = args[ci + 1].split(',').map(Number);
if (cuts[0] !== 0) cuts.unshift(0);
const script = cuts.map((c, i) => words.slice(c, cuts[i + 1] ?? words.length).map(w => w[0]).join(' '));
console.log('  const SCRIPT = [\n' + script.map(s => '    ' + JSON.stringify(s).replace(/'/g, "\\'").replace(/^"|"$/g, "'")).join(',\n') + '\n  ];');
console.log('  const WORDS = ' + JSON.stringify(words) + ';');
