"""Run before every push so phones load the newest files:  python3 tools/bump.py"""
import os, re, time
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
v = str(int(time.time()))[-8:]
n = 0
for f in os.listdir(ROOT):
    if f.endswith('.html'):
        p = os.path.join(ROOT, f)
        t = open(p, encoding='utf-8').read()
        t2 = re.sub(r'(assets/(?:css|js)/[a-z.]+)\?v=\d+', r'\1?v=' + v, t)
        if t2 != t:
            open(p, 'w', encoding='utf-8').write(t2); n += 1
print('Version %s written to %d pages.' % (v, n))
