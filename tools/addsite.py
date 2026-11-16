"""Fill shop details (address, email, GST, map). Run:  python3 tools/addsite.py   (press Enter to keep a value)"""
import os, sys, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import common
F = os.path.join(common.REPO, 'data', 'site.json')
d = json.load(open(F, encoding='utf-8'))
for k, label in (('address', 'Shop address'), ('email', 'Email'), ('gstNumber', 'GST number'),
                 ('mapUrl', 'Google Maps link (Share > Copy link)'), ('mapEmbed', 'Map embed link (Share > Embed a map > only the src="..." part)')):
    v = input('%s [%s]: ' % (label, d.get(k, ''))).strip()
    if v:
        d[k] = v
json.dump(d, open(F, 'w', encoding='utf-8'), indent=2, ensure_ascii=False)
print('Saved.')
