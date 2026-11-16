"""Add delivery towns. Run:  python3 tools/adddelivery.py"""
import os, sys, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import common
F = os.path.join(common.REPO, 'data', 'delivery.json')
d = json.load(open(F, encoding='utf-8'))
raw = input('Towns you deliver to (comma separated): ')
for a in [x.strip() for x in raw.split(',') if x.strip()]:
    if a not in d['areas']:
        d['areas'].append(a)
json.dump(d, open(F, 'w', encoding='utf-8'), indent=2, ensure_ascii=False)
print('Delivery areas now:', ', '.join(d['areas']))
