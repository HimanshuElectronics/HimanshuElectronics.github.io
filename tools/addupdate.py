"""Add a Latest Update to the home page strip:  python3 tools/addupdate.py"""
import json, os, datetime
F = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'updates.json')
rows = json.load(open(F, encoding='utf-8'))
title = input('Title (short): ').strip()
text = input('Second line (optional): ').strip()
link = input('Page to open when tapped (example products.html, or Enter for none): ').strip()
exp = input('Hide after date YYYY-MM-DD (or Enter): ').strip()
u = {'id': max([r.get('id', 0) for r in rows] + [0]) + 1, 'title': title, 'text': text, 'date': str(datetime.date.today()), 'link': link, 'isActive': True}
if exp:
    u['expiresOn'] = exp
rows.insert(0, u)
json.dump(rows, open(F, 'w', encoding='utf-8'), indent=2, ensure_ascii=False)
print('Added.')
