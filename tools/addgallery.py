"""Add a gallery photo. Run:  python3 tools/addgallery.py"""
import os, sys, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import common
F = os.path.join(common.REPO, 'data', 'gallery.json')
d = json.load(open(F, encoding='utf-8'))
title = input('Photo title (example: Our shop front): ').strip()
print('Sections: products, shop, delivery, events')
sec = input('Section: ').strip().lower() or 'shop'
feat = input('Show at the top (featured)? y/n: ').strip().lower() == 'y'
slug = ''.join(ch if ch.isalnum() else '-' for ch in title.lower()).strip('-') or 'photo'
pics = common.ask_photos(slug, folder='gallery', many=False)
if not pics:
    sys.exit('No photo added.')
d['items'].append({'title': title, 'image': pics[0], 'section': sec, 'isFeatured': feat, 'sortOrder': len(d['items']) + 1})
json.dump(d, open(F, 'w', encoding='utf-8'), indent=2, ensure_ascii=False)
print('Added to gallery:', title)
