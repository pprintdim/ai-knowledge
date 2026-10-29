// node cdp-frames.mjs url outDir frames period dpr [clipX clipY clipW clipH (css, відносно полотна)]
// Кадри циклу вітру: window.__bagRender(t) → знімок полотна на прозорому тлі.
import { spawn } from 'node:child_process';
import { writeFileSync, mkdtempSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
const [url, outDir, frames = '12', period = '6', dpr = '1', cx, cy, cw, ch] = process.argv.slice(2);
mkdirSync(outDir, { recursive: true });
const CH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const prof = mkdtempSync(join(process.env.SCRATCH, 'cdpf-'));
const port = 9950 + Math.floor(Math.random() * 40);
const chrome = spawn(CH, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`, '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let ws, id = 0; const pend = new Map();
const cdp = (method, params = {}) => { const i = ++id; ws.send(JSON.stringify({ id: i, method, params })); return new Promise((res, rej) => pend.set(i, { res, rej })); };
const ev = async (expr) => (await cdp('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true })).result.value;
try {
  let t; for (let k = 0; k < 50 && !t; k++) { await sleep(200); try { t = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((x) => x.type === 'page'); } catch {} }
  ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise((r) => ws.addEventListener('open', r));
  ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { m.error ? pend.get(m.id).rej(new Error(m.error.message)) : pend.get(m.id).res(m.result); pend.delete(m.id); } });
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1500, height: 2200, deviceScaleFactor: +dpr, mobile: false });
  await cdp('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });
  await cdp('Page.enable'); await cdp('Runtime.enable');
  await cdp('Page.navigate', { url });
  for (let k = 0; k < 120 && !(await ev('!!window.__bagRender')); k++) await sleep(250);
  const c = JSON.parse(await ev("JSON.stringify((()=>{const r=document.querySelector('canvas').getBoundingClientRect();return [r.left,r.top,r.width,r.height]})())"));
  const clip = cx !== undefined ? { x: c[0] + +cx, y: c[1] + +cy, width: +cw, height: +ch, scale: 1 } : { x: c[0], y: c[1], width: c[2], height: c[3], scale: 1 };
  console.log('canvas', JSON.stringify(c), 'clip', JSON.stringify(clip));
  const n = +frames;
  for (let i = 0; i < n; i++) {
    await ev(`window.__bagRender(${(i / n) * +period})`);
    const shot = await cdp('Page.captureScreenshot', { format: 'png', clip });
    writeFileSync(join(outDir, `f${String(i).padStart(4, '0')}.png`), Buffer.from(shot.data, 'base64'));
  }
  console.log('frames', n);
} catch (e) { console.error('ERR', e.message); } finally { try { ws.close(); } catch {} chrome.kill('SIGKILL'); process.exit(0); }
