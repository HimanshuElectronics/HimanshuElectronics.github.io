"""Add a new brand.  Run:  python3 tools/addbrand.py
A brand without a logo is fine: the brand name is shown instead."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import common as c

brands = c.load('brands.json')
name = input('Brand name (example: Polycab): ').strip()
if not name:
    sys.exit('Name is needed.')
slug = c.slugify(name)
if any(b.get('slug') == slug or b.get('name', '').lower() == name.lower() for b in brands):
    sys.exit('This brand already exists. Add products to it with addproduct.py.')
desc = input('One line about the brand (optional): ').strip()
want = input('Add a logo photo from your phone? (y/n): ').strip().lower() == 'y'
logo = None
if want:
    got = c.ask_photos(slug, folder='brands', many=False)
    logo = got[0] if got else None
bid = max([b.get('id', 0) for b in brands] + [100]) + 1
row = {'id': bid, 'name': name, 'slug': slug, 'isActive': True, 'sortOrder': bid - 100}
if desc:
    row['description'] = desc
if logo:
    row['logo'] = logo
brands.append(row)
c.save('brands.json', brands)
print('\nAdded brand: %s. Total brands: %d' % (name, len(brands)))
print('Now add its products:  python3 tools/addproduct.py')
