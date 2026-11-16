"""Add a FAQ. Run:  python3 tools/addfaq.py"""
import os, sys, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import common
F = os.path.join(common.REPO, 'data', 'faqs.json')
d = json.load(open(F, encoding='utf-8'))
q = input('Question: ').strip()
a = input('Answer: ').strip()
print('Category: products, delivery, bulk, payments, service, general')
c = input('Category: ').strip().lower() or 'general'
pop = input('Show as popular? y/n: ').strip().lower() == 'y'
d.append({'id': max([x.get('id', 0) for x in d] + [0]) + 1, 'category': c, 'question': q, 'answer': a, 'isPopular': pop, 'isPublished': True, 'sortOrder': len(d) + 1})
json.dump(d, open(F, 'w', encoding='utf-8'), indent=2, ensure_ascii=False)
print('FAQ added.')
