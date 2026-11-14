"""Add a worker for home service. Run:  python3 tools/addworker.py"""
import json
import os
F = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'workers.json')
d = json.load(open(F, encoding='utf-8'))
name = input('Worker name: ').strip()
role = input('Role (example: Fan and cooler specialist): ').strip()
print('Skills must match these words: Fan repair, Iron repair, LED / TV repair, Cooler repair, Wiring & fitting')
skills = [s.strip() for s in input('Skills (comma separated): ').split(',') if s.strip()]
area = input('Area he covers: ').strip()
exp = input('Experience (example: 8 years): ').strip()
wid = ''.join(ch if ch.isalnum() else '-' for ch in name.lower()).strip('-')
d['workers'].append({'id': wid, 'name': name, 'role': role, 'skills': skills, 'area': area, 'exp': exp, 'available': True})
json.dump(d, open(F, 'w', encoding='utf-8'), indent=2, ensure_ascii=False)
print('Added:', name)
