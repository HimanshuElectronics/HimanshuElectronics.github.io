"""Add more photos to an existing product.  Run:  python3 tools/addphoto.py"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import common as c

prods = c.load('products.json')
if not prods:
    sys.exit('No products yet. Use addproduct.py first.')
q = input('Part of the product name: ').strip().lower()
found = {p['id']: p['name'] for p in prods if q in p['name'].lower()}
if not found:
    sys.exit('No product found with that name.')
pid = c.pick('Which product?', found)
p = [x for x in prods if x['id'] == pid][0]
imgs = p.get('images') or []
new = c.ask_photos(p['slug'], existing=len(imgs))
p['images'] = imgs + new
c.save('products.json', prods)
print('\n%d photo(s) added to %s. It now has %d.' % (len(new), p['name'], len(p['images'])))
