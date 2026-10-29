// node cdp-shot.mjs <url> <out.png> [width] [height] [waitMs] [mobile] [reducedMotion] [evalJs]
// Знімок через Chrome DevTools Protocol у реальному часі (headless з virtual-time не дочікується 3D).
import { spawn } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [url, out, w = '1440', h = '900', wait = '15000', mobile = '0', rm = '0', evalJs = ''] = process.argv.slice(2);
const CH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const prof = mkdtempSync(join(process.env.SCRATCH || tmpdir(), 'cdp-'));
const port = 9300 + Math.floor(Math.random() * 500);
const chrome = spawn(CH, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`, '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let ws, id = 0; const pend = new Map(); const logs = [];
async function cdp(method, params = {}) { const i = ++id; ws.send(JSON.stringify({ id: i, method, params })); return new Promise((res, rej) => pend.set(i, { res, rej })); }
try {
  let target;
  for (let k = 0; k < 50 && !target; k++) { await sleep(200); try { const l = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); target = l.find((t) => t.type === 'page'); } catch {} }
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r));
  ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { m.error ? pend.get(m.id).rej(new Error(m.error.message)) : pend.get(m.id).res(m.result); pend.delete(m.id); } else if (m.method === 'Runtime.consoleAPICalled') logs.push(m.params.type + ': ' + m.params.args.map((a) => a.value ?? a.description).join(' ')); else if (m.method === 'Runtime.exceptionThrown') logs.push('EXC: ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text)); });
  await cdp('Runtime.enable');
  await cdp('Emulation.setDeviceMetricsOverride', { width: +w, height: +h, deviceScaleFactor: mobile === '1' ? 2 : 1, mobile: mobile === '1' });
  if (rm === '1') await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await cdp('Page.enable');
  await cdp('Page.navigate', { url });
  await sleep(+wait);
  if (evalJs) { const r = await cdp('Runtime.evaluate', { expression: evalJs, awaitPromise: true, returnByValue: true }); logs.push('EVAL: ' + JSON.stringify(r.result.value)); await sleep(+(process.env.POSTWAIT ?? 1500)); }
  const shot = await cdp('Page.captureScreenshot', { format: 'png' });
  writeFileSync(out, Buffer.from(shot.data, 'base64'));
  console.log('saved', out); logs.forEach((l) => console.log(l));
} catch (e) { console.error('ERR', e.message); logs.forEach((l) => console.log(l)); }
finally { try { ws && ws.close(); } catch {} chrome.kill('SIGKILL'); process.exit(0); }
