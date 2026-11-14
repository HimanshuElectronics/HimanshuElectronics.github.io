"""Add a new product.  Run:  python3 tools/addproduct.py   (from the site folder)"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import common as c

cats = {x['id']: x['name'] for x in c.load('categories.json')}
brands = {x['id']: x['name'] for x in c.load('brands.json') if x.get('isActive', True)}
prods = c.load('products.json')

name = input('Product name (example: Ceiling Fan 1200 mm): ').strip()
if not name:
    sys.exit('Name is needed.')
cat = c.pick('Which category?', cats)
brands_opt = dict(brands)
brands_opt[0] = '(no brand)'
brand = c.pick('Which brand?', brands_opt)
pack = input('Size / pack (example: 1200 mm) or press Enter to skip: ').strip()
price_raw = input('Price in rupees, numbers only, or press Enter to keep "Contact for price": ').strip()
price = int(price_raw) if price_raw.isdigit() else None
desc = c.ask_line('Short description (optional, press Enter to skip): ')
feat = input('Show on the home page Popular Products? (y/n): ').strip().lower() == 'y'

slug = c.slugify(((brands[brand] + ' ') if brand else '') + name)
if any(p.get('slug') == slug for p in prods):
    sys.exit('A product with this name already exists. Use addphoto.py to add photos to it.')
photos = c.ask_photos(slug)

pid = max([p.get('id', 0) for p in prods] + [0]) + 1
prods.append({'id': pid, 'name': name, 'slug': slug, 'categoryId': cat, 'brandId': brand or None,
              'packagingInfo': pack or None, 'description': desc or None, 'images': photos, 'price': price,
              'featured': feat, 'sortOrder': pid, 'status': 'published'})
c.save('products.json', prods)
print('\nAdded: %s (%s) with %d photo(s). Total products: %d' % (name, cats[cat], len(photos), len(prods)))
