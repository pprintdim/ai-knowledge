#!/usr/bin/env python3
"""Перезбереження інстансу home_bag (module_id=41) штатною формою адмінки realchem: форма віддає лише поля
поточної схеми (нові ключі заповнюються з defaults моделі, зайві зникають з oc_module).
Без --apply лише показує, що буде відправлено. Пароль адмінки з ACCESS.md не друкується."""
import re, sys, os, urllib.request, urllib.parse, http.cookiejar
from html.parser import HTMLParser

BASE = 'https://realchem.com.ua/rc_panel/index.php'
OUT = os.path.dirname(os.path.abspath(__file__))
APPLY = '--apply' in sys.argv
MID = '41'

acc = open(os.path.expanduser('~/AI-Workspace/secrets/ACCESS.md'), encoding='utf-8').read()
PASSWORD = re.search(r'OpenCart 3\.0\.3\.9 realchem\.com\.ua встановлено.*?логін `admin` / `([^`]+)`', acc).group(1)
cj = http.cookiejar.CookieJar()
class NR(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k): return None
op = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj), NR())
def req(route, params='', data=None):
    body = urllib.parse.urlencode(data).encode() if data is not None else None
    try:
        r = op.open(BASE + '?route=' + route + params, body, timeout=60)
        return r.status, r.headers.get('Location', ''), r.read().decode('utf-8', 'replace')
    except urllib.error.HTTPError as e:
        return e.code, e.headers.get('Location', ''), e.read().decode('utf-8', 'replace')

class Form(HTMLParser):
    """Поля форми #form-module поза <template> (шаблони порожніх рядків повторювача)."""
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.fields, self.in_form, self.tpl, self.ta, self.sel, self.sel_val = [], False, 0, None, None, None
    def handle_starttag(self, tag, a):
        a = dict(a)
        if tag == 'form' and a.get('id') == 'form-module': self.in_form = True
        if not self.in_form: return
        if tag == 'template': self.tpl += 1
        if self.tpl: return
        if tag == 'input' and a.get('name'):
            t = (a.get('type') or 'text').lower()
            if t in ('checkbox', 'radio') and 'checked' not in a: return
            if t in ('submit', 'button', 'file'): return
            self.fields.append((a['name'], a.get('value', '')))
        elif tag == 'textarea' and a.get('name'):
            self.ta = [a['name'], '']
        elif tag == 'select' and a.get('name'):
            self.sel, self.sel_val = a['name'], None
        elif tag == 'option' and self.sel is not None:
            if 'selected' in a or self.sel_val is None: self.sel_val = (a.get('value', ''), 'selected' in a)
    def handle_endtag(self, tag):
        if tag == 'form' and self.in_form: self.in_form = False
        if tag == 'template' and self.tpl: self.tpl -= 1
        if tag == 'textarea' and self.ta: self.fields.append(tuple(self.ta)); self.ta = None
        if tag == 'select' and self.sel is not None:
            self.fields.append((self.sel, self.sel_val[0] if self.sel_val else '')); self.sel = None
    def handle_data(self, d):
        if self.ta is not None: self.ta[1] += d

st, loc, b = req('common/login', '', {'username': 'admin', 'password': PASSWORD, 'redirect': ''})
T = '&user_token=' + re.search(r'user_token=(\w+)', loc or b).group(1)
st, loc, form = req('extension/module/home_bag', T + '&module_id=' + MID)
assert st == 200, st
open(os.path.join(OUT, 'home_bag-41-form-before.html'), 'w', encoding='utf-8').write(form)
f = Form(); f.feed(form)
if not f.fields:
    print('form-module not found; form ids:', re.findall(r'<form[^>]*id="([^"]+)"', form)); sys.exit(1)
for k, v in f.fields: print(f'  {k} = {v[:60]!r}')
print('total fields:', len(f.fields), '| products fields:', sum(1 for k, _ in f.fields if '[products]' in k))
if not APPLY: sys.exit(0)
st, loc, body = req('extension/module/home_bag', T + '&module_id=' + MID, f.fields)
print('save ->', st, 'ok (redirect to module list)' if 'extension/extension' in loc or 'marketplace/extension' in loc else loc[:100])
err = re.findall(r'(?:alert-danger|text-danger)[^>]*>\s*(?:<[^>]+>\s*)*([^<]{3,200})', body)
if err: print('ERRORS:', err[:5])
