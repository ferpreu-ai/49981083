// Simula la reproducción completa de un explainer con un lienzo falso.
// Detecta errores de ejecución, valores no finitos y palabras de at() que no existen. No abre un navegador.
// Uso:
//   node simular.cjs explainer.html              formato del archivo
//   node simular.cjs explainer.html --todos      prueba 9:16, 16:9, 1:1 y 4:5
//   node simular.cjs explainer.html --seg 200    segundos simulados (150 por defecto)
const fs = require('fs');
const args = process.argv.slice(2);
const file = args.find(a => !a.startsWith('--') && args[args.indexOf(a) - 1] !== '--seg');
const segIdx = args.indexOf('--seg');
const seconds = segIdx >= 0 ? Number(args[segIdx + 1]) : 150;
if (!file) { console.error('Uso: node simular.cjs explainer.html [--todos] [--seg 150]'); process.exit(2); }
const html = fs.readFileSync(file, 'utf8');

// Script principal: el último <script> inline sin atributos
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
if (!scripts.length) { console.error('No encontré un <script> inline.'); process.exit(2); }
const code = scripts[scripts.length - 1];

// Variables CSS del primer bloque :root
const rootBlock = (html.match(/:root\s*\{([\s\S]*?)\}/) || [, ''])[1];
const vars = {};
for (const m of rootBlock.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) vars[m[1]] = m[2].trim();

const noop = () => {};
const grad = { addColorStop: noop };
const finite = (name, ...v) => { if (!v.every(Number.isFinite)) throw new Error(`${name} recibió valores no finitos: ${v.join(', ')}`); };
function makeCtx() {
  return new Proxy({}, {
    get: (o, k) => {
      if (k in o) return o[k];
      if (k === 'createRadialGradient' || k === 'createLinearGradient') return (...a) => { finite(k, ...a); return grad; };
      if (k === 'measureText') return s => ({ width: String(s).length * 7 });
      if (k === 'arc') return (x, y, r) => { finite('arc', x, y, r); if (r < 0) throw new Error(`arc con radio negativo: ${r}`); };
      if (k === 'ellipse') return (x, y, rx, ry) => { finite('ellipse', x, y, rx, ry); if (rx < 0 || ry < 0) throw new Error(`ellipse con radio negativo: ${rx}, ${ry}`); };
      if (k === 'roundRect') return (x, y, w, h) => finite('roundRect', x, y, w, h);
      if (k === 'fillRect' || k === 'strokeRect' || k === 'rect' || k === 'clearRect') return (x, y, w, h) => finite(k, x, y, w, h);
      if (k === 'moveTo' || k === 'lineTo') return (x, y) => finite(k, x, y);
      if (k === 'translate' || k === 'scale') return (x, y) => finite(k, x, y);
      if (k === 'setTransform') return (...a) => finite(k, ...a);
      if (k === 'fillText') return (s, x, y) => finite(k, x, y);
      return noop;
    },
    set: (o, k, v) => { if (k === 'lineWidth' || k === 'globalAlpha') finite(k, v); o[k] = v; return true; }
  });
}

function run(query, size) {
  const ctx = makeCtx();
  function el() {
    return {
      classList: { add: noop, remove: noop, toggle: noop, contains: () => false },
      style: { setProperty: noop }, dataset: {}, children: [], hidden: false, offsetWidth: 1, textContent: '',
      addEventListener: noop, setAttribute: noop, removeAttribute: noop, toggleAttribute: noop, focus: noop, appendChild: noop,
      getBoundingClientRect: () => ({ width: size[0], height: size[1], left: 0, top: 0 }),
      querySelector: () => el(), querySelectorAll: () => [], closest: () => null, getContext: () => ctx,
      set innerHTML(v) {}, get innerHTML() { return ''; }
    };
  }
  const els = {};
  global.document = { getElementById: id => els[id] || (els[id] = el()), querySelector: () => el(), querySelectorAll: () => [], addEventListener: noop, createElement: el, documentElement: {}, body: el(), fonts: null };
  global.window = { devicePixelRatio: 2, addEventListener: noop };
  global.location = { search: query };
  global.matchMedia = () => ({ matches: false, addEventListener: noop });
  global.getComputedStyle = () => ({ getPropertyValue: k => vars[k] || '' });
  global.ResizeObserver = class { observe() {} };
  global.HTMLButtonElement = class {};
  global.performance = { now: () => 0 };
  const warnings = new Set();
  const origWarn = console.warn;
  console.warn = (...a) => warnings.add(a.join(' '));
  let cb = null;
  global.requestAnimationFrame = f => { cb = f; };
  const label = query ? query.replace('?formato=', '') : 'formato del archivo';
  try {
    try { eval(code); } catch (e) { console.log(`[${label}] ERROR al cargar:`, e.message); return false; }
    if (!cb) { console.log(`[${label}] ERROR: el script no pidió ningún requestAnimationFrame.`); return false; }
    let now = 0, frames = 0;
    const step = 40, total = seconds * 1000 / step;
    try {
      for (; frames < total; frames++) { now += step; const f = cb; cb = null; f(now); if (!cb) break; }
      // Cada escena también se dibuja por renderAt, como en el render
      const dur = global.window.__duration;
      if (typeof global.window.renderAt === 'function' && dur) for (let t = 0; t < dur; t += .25) global.window.renderAt(t);
    } catch (e) {
      console.log(`[${label}] ERROR en ${(now / 1000).toFixed(2)} s:`, e.stack.split('\n').slice(0, 3).join(' | '));
      return false;
    }
    const d = global.window.__duration;
    for (const w of warnings) console.log(`[${label}] AVISO: ${w}`);
    console.log(`[${label}] OK: ${frames} cuadros, ${(now / 1000).toFixed(1)} s simulados, duración ${d ? d.toFixed(1) : '?'} s${warnings.size ? `, ${warnings.size} aviso(s)` : ', sin errores'}.`);
    return warnings.size === 0;
  } finally {
    console.warn = origWarn;
  }
}

const SIZES = { '9:16': [360, 640], '16:9': [640, 360], '1:1': [480, 480], '4:5': [400, 500] };
let ok = true;
if (args.includes('--todos')) for (const [f, s] of Object.entries(SIZES)) ok = run('?formato=' + f, s) && ok;
else ok = run('', [390, 780]);
process.exit(ok ? 0 : 1);
