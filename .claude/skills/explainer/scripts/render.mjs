// Renderiza un explainer cuadro por cuadro con un navegador sin ventana.
// Congela la página en cada t con window.renderAt(t) y guarda PNG exactos.
//
// Uso:
//   node render.mjs explainer.html                      video completo (MP4)
//   node render.mjs explainer.html --fotos finales      foto del final de cada escena, más una hoja de contacto
//   node render.mjs explainer.html --fotos gancho       una foto cada 0,5 s en los primeros 10 s
//   node render.mjs explainer.html --fotos 0,2.5,7      fotos en esos segundos
//   node render.mjs explainer.html --hoja 12            hoja de contacto con 12 cuadros repartidos
//
// Opciones:
//   --fps N        cuadros por segundo (30)
//   --corto N      lado corto en px CSS (360). Con --escala 3 da 1080.
//   --escala N     factor de píxeles (3)
//   --w N --h N    viewport exacto en px CSS. Si no se pasan, salen del formato del explainer.
//   --seg N        duración en segundos (por defecto, window.__duration)
//   --query q      parámetros extra de la URL, por ejemplo "bare=1"
//   --salida dir   carpeta de salida (out junto al HTML)
//   --nombre n     nombre del MP4 (nombre del HTML)
import { pathToFileURL } from 'node:url';
import { mkdirSync, rmSync, existsSync, copyFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

let chromium;
try { ({ chromium } = await import('playwright')); }
catch {
  console.error('Falta Playwright. Instalalo una vez:\n  cd ' + path.dirname(new URL(import.meta.url).pathname) + ' && npm install && npx playwright install chromium');
  process.exit(2);
}
try { execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' }); }
catch { console.error('Falta ffmpeg. En macOS: brew install ffmpeg. En Windows: winget install ffmpeg. En Linux: apt install ffmpeg.'); process.exit(2); }

const args = process.argv.slice(2);
const file = args.find((a, i) => !a.startsWith('--') && !args[i - 1]?.startsWith('--'));
if (!file) { console.error('Uso: node render.mjs explainer.html [--fotos finales] [--hoja 12] [--fps 30]'); process.exit(2); }
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const FPS = Number(opt('fps', 30)), SCALE = Number(opt('escala', 3)), SHORT = Number(opt('corto', 360));
const abs = path.resolve(file);
const base = path.basename(abs, path.extname(abs));
const OUT = path.resolve(opt('salida', path.join(path.dirname(abs), 'out')));
const query = opt('query', '');
const fotos = opt('fotos', null);
const hoja = opt('hoja', null);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: SHORT, height: SHORT }, deviceScaleFactor: SCALE });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
const url = pathToFileURL(abs).href + '?render=1' + (query ? '&' + query : '');
await page.goto(url, { waitUntil: 'networkidle' });

// El viewport sale del formato del explainer (window.__aspect), salvo que se pase --w y --h
const ar = await page.evaluate(() => window.__aspect || [9, 16]);
let VW = Number(opt('w', 0)), VH = Number(opt('h', 0));
if (!VW || !VH) {
  const [a, b] = ar;
  if (a <= b) { VW = SHORT; VH = Math.round(SHORT * b / a); } else { VH = SHORT; VW = Math.round(SHORT * a / b); }
}
await page.setViewportSize({ width: VW, height: VH });
await page.evaluate(async () => { await document.fonts.ready; await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); });
const hasRenderAt = await page.evaluate(() => typeof window.renderAt === 'function');
if (!hasRenderAt) console.warn('Aviso: la página no expone window.renderAt(t). Solo se congelan las animaciones CSS.');
const SECS = Number(opt('seg', 0)) || await page.evaluate(() => window.__duration || 6);
const ESC = await page.evaluate(() => window.__escenas || []);

async function shot(t, out) {
  await page.evaluate(t => {
    if (window.renderAt) window.renderAt(t);
    document.getAnimations().forEach(a => { a.pause(); a.currentTime = t * 1000; });
  }, t);
  await page.screenshot({ path: out });
}

function contactSheet(dir, count, out) {
  const wide = VW > VH, cols = Math.min(wide ? 3 : 4, count), rows = Math.ceil(count / cols);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', path.join(dir, '%03d.png'),
    '-vf', `scale=${wide ? 480 : 270}:-1,tile=${cols}x${rows}:padding=6:color=0x222222`, '-frames:v', '1', out]);
}

function photoTimes() {
  if (hoja) return Array.from({ length: Number(hoja) }, (_, i) => +(SECS * (i + .5) / Number(hoja)).toFixed(2));
  if (fotos === 'finales') {
    if (!ESC.length) { console.error('La página no expone window.__escenas. Pasá los segundos a mano.'); process.exit(2); }
    return ESC.map(e => +(e.inicio + e.dur - .15).toFixed(2));
  }
  if (fotos === 'gancho') return Array.from({ length: 20 }, (_, i) => +(i * .5 + .01).toFixed(2)).filter(t => t < SECS);
  return fotos.split(',').map(Number);
}

if (fotos || hoja) {
  const dir = path.join(OUT, 'fotos');
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const times = photoTimes();
  const seq = path.join(OUT, 'seq');
  rmSync(seq, { recursive: true, force: true }); mkdirSync(seq);
  for (const [i, t] of times.entries()) {
    const out = path.join(dir, `${String(i).padStart(3, '0')}_t${t.toFixed(2)}.png`);
    await shot(t, out);
    // ffmpeg necesita nombres consecutivos para la hoja
    copyFileSync(out, path.join(seq, `${String(i).padStart(3, '0')}.png`));
  }
  const sheet = path.join(OUT, 'hoja.png');
  contactSheet(seq, times.length, sheet);
  rmSync(seq, { recursive: true, force: true });
  console.log(`Fotos: ${times.length} en ${dir} (${times.join(', ')} s)`);
  console.log(`Hoja de contacto: ${sheet}`);
} else {
  const dir = path.join(OUT, 'cuadros');
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const N = Math.round(SECS * FPS);
  const t0 = Date.now();
  for (let i = 0; i < N; i++) {
    await shot(i / FPS, path.join(dir, `${String(i).padStart(5, '0')}.png`));
    if (i % (FPS * 5) === 0) console.log(`cuadro ${i}/${N}  ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  }
  const mp4 = path.join(OUT, `${opt('nombre', base)}.mp4`);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(dir, '%05d.png'),
    '-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-crf', '18', '-movflags', '+faststart', mp4]);
  rmSync(dir, { recursive: true, force: true });
  console.log(`MP4: ${mp4} (${N} cuadros, ${SECS.toFixed(2)} s, ${FPS} fps, ${VW * SCALE}x${VH * SCALE})`);
}
await browser.close();
if (errors.length) { console.log('Errores de la página:\n' + errors.join('\n')); process.exit(1); }
if (!existsSync(OUT)) process.exit(1);
