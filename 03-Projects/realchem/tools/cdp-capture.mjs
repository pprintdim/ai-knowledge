// node cdp-capture.mjs url out.png waitMs — знімок полотна 3D на прозорому тлі (DPR 2, reduced-motion)
import { spawn } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { join } from 'node:path';
const [url, out, wait = '8000'] = process.argv.slice(2);
const CH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const prof = mkdtempSync(join(process.env.SCRATCH, 'cdpc-'));
const port = 9800 + Math.floor(Math.random() * 150);
const chrome = spawn(CH, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`, '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let ws, id = 0; const pend = new Map();
const cdp = (method, params = {}) => { const i = ++id; ws.send(JSON.stringify({ id: i, method, params })); return new Promise((res, rej) => pend.set(i, { res, rej })); };
try {
  let t; for (let k = 0; k < 50 && !t; k++) { await sleep(200); try { t = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((x) => x.type === 'page'); } catch {} }
  ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise((r) => ws.addEventListener('open', r));
  ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { m.error ? pend.get(m.id).rej(new Error(m.error.message)) : pend.get(m.id).res(m.result); pend.delete(m.id); } });
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1500, height: 2200, deviceScaleFactor: 2, mobile: false });
  await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await cdp('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });
  await cdp('Page.enable'); await cdp('Runtime.enable');
  await cdp('Page.navigate', { url }); await sleep(+wait);
  const r = await cdp('Runtime.evaluate', { expression: "JSON.stringify((()=>{const c=document.querySelector('canvas').getBoundingClientRect(),s=document.querySelector('[data-bag-stage]').getBoundingClientRect();return {c:[c.left,c.top,c.width,c.height],s:[s.left,s.top,s.width,s.height],ready:document.querySelector('[data-bag]').className}})())", returnByValue: true });
  const g = JSON.parse(r.result.value); console.log(JSON.stringify(g));
  const shot = await cdp('Page.captureScreenshot', { format: 'png', clip: { x: g.c[0], y: g.c[1], width: g.c[2], height: g.c[3], scale: 1 } });
  writeFileSync(out, Buffer.from(shot.data, 'base64')); console.log('saved', out);
} catch (e) { console.error('ERR', e.message); } finally { try { ws.close(); } catch {} chrome.kill('SIGKILL'); process.exit(0); }
