"""Add an independent technician. Run:  python3 tools/addworker.py"""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import common
F = os.path.join(common.REPO, 'data', 'workers.json')
d = json.load(open(F, encoding='utf-8'))
name = input('Technician name: ').strip()
phone = input('His mobile number (10 digits): ').strip()
role = input('Role (example: Fan and cooler specialist): ').strip()
print('Skills must match: Fan repair, Iron repair, LED / TV repair, Cooler repair, Wiring & fitting')
skills = [s.strip() for s in input('Skills (comma separated): ').split(',') if s.strip()]
area = input('Area he covers: ').strip()
exp = input('Experience (example: 8 years): ').strip()
bio = input('Short introduction (one or two lines): ').strip()
wid = ''.join(ch if ch.isalnum() else '-' for ch in name.lower()).strip('-')
pics = common.ask_photos(wid, folder='workers', many=False)
photo = pics[0] if pics else ''
d['workers'].append({'id': wid, 'name': name, 'phone': phone, 'role': role, 'skills': skills, 'area': area, 'exp': exp, 'bio': bio, 'photo': photo, 'available': True})
json.dump(d, open(F, 'w', encoding='utf-8'), indent=2, ensure_ascii=False)
print('Added:', name)
