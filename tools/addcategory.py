"""Add a new product category.  Run:  python3 tools/addcategory.py"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import common as c

cats = c.load('categories.json')
name = input('Category name (example: Switches): ').strip()
if not name:
    sys.exit('Name is needed.')
slug = c.slugify(name)
if any(x.get('slug') == slug or x.get('name', '').lower() == name.lower() for x in cats):
    sys.exit('This category already exists.')
n = c.pick('Which drawing should the category use?', {k: v[1] for k, v in c.ICONS.items()})
sub = input('Short line under the name (example: All sizes) or press Enter to skip: ').strip()
cid = max([x.get('id', 0) for x in cats] + [0]) + 1
cats.append({'id': cid, 'name': name, 'slug': slug, 'icon': c.ICONS[n][0], 'sub': sub, 'sortOrder': cid})
c.save('categories.json', cats)
print('\nAdded category: %s. Total categories: %d' % (name, len(cats)))
print('Now add products to it:  python3 tools/addproduct.py')
