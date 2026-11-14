"""Shared helpers for the Termux tools (addproduct.py, addcategory.py, addbrand.py, addphoto.py).
Run them from Termux like:  python3 ~/himanshu/tools/addproduct.py
"""
import json, os, re, shutil, select, sys, time

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHARED = os.path.expanduser('~/storage/shared')
PHOTO_ROOTS = [os.path.join(SHARED, d) for d in ('DCIM', 'Pictures', 'Download')]
PHOTO_EXT = ('.png', '.jpg', '.jpeg', '.webp')
ORIGIN = 'https://himanshuelectronics.github.io'
ICONS = {1: ('i-box', 'Box (general)'), 2: ('i-fan', 'Fan'), 3: ('i-bulb', 'Bulb / light'), 4: ('i-wire', 'Wire / cable'),
         5: ('i-iron', 'Iron'), 6: ('i-kettle', 'Kettle / appliance'), 7: ('i-tv', 'TV')}


def load(name):
    with open(os.path.join(REPO, 'data', name), encoding='utf-8') as f:
        return json.load(f)


def save(name, rows):
    with open(os.path.join(REPO, 'data', name), 'w', encoding='utf-8') as f:
        json.dump(rows, f, indent=2, ensure_ascii=False)
    if name == 'products.json':
        rebuild_sitemap(rows)


def slugify(text):
    return re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')


def pick(title, options):
    print('\n' + title)
    for k, v in options.items():
        print('  %s = %s' % (k, v))
    while True:
        try:
            n = int(input('Number: ').strip())
            if n in options:
                return n
        except ValueError:
            pass
        print('Please type one of the numbers above.')


def ask_line(prompt):
    """Ask one question. Extra pasted lines are joined into the same answer."""
    sys.stdout.write(prompt)
    sys.stdout.flush()
    parts = [sys.stdin.readline().strip()]
    time.sleep(0.5)
    while True:
        ready, _, _ = select.select([sys.stdin], [], [], 0.4)
        if not ready:
            break
        line = sys.stdin.readline()
        if not line:
            break
        parts.append(line.strip())
    return ' '.join(p for p in parts if p)


def drain_input(wait=0.8):
    try:
        import termios
        time.sleep(wait)
        termios.tcflush(sys.stdin.fileno(), termios.TCIFLUSH)
    except Exception:
        pass


def _all_photos():
    found = []
    for root in PHOTO_ROOTS:
        for folder, dirs, files in os.walk(root):
            dirs[:] = [d for d in dirs if not d.startswith('.')]
            if folder[len(root):].count(os.sep) > 3:
                dirs[:] = []
                continue
            for f in files:
                if f.startswith('.') or not f.lower().endswith(PHOTO_EXT):
                    continue
                p = os.path.join(folder, f)
                try:
                    found.append((os.path.getmtime(p), p))
                except OSError:
                    pass
    found.sort(reverse=True)
    return found


def find_photo(name):
    raw = name.strip().strip('"').strip("'")
    if not raw:
        return None
    full = os.path.expanduser(raw)
    if os.path.isfile(full):
        return full
    want = raw.lower()
    for _, p in _all_photos():
        f = os.path.basename(p).lower()
        if f == want or os.path.splitext(f)[0] == want:
            return p
    return None


def save_photo(src, out_base, folder='products', size=1000):
    """Save a photo into assets/images/<folder>. With Pillow it is resized and saved as small .webp;
    without Pillow it is just copied."""
    dest = os.path.join(REPO, 'assets', 'images', folder)
    os.makedirs(dest, exist_ok=True)
    try:
        from PIL import Image
        im = Image.open(src)
        if im.mode in ('RGBA', 'LA') or (im.mode == 'P' and 'transparency' in im.info):
            im = im.convert('RGBA')
            bg = Image.new('RGB', im.size, (255, 255, 255))
            bg.paste(im, mask=im.split()[-1])
            im = bg
        else:
            im = im.convert('RGB')
        im.thumbnail((size, size), Image.LANCZOS)
        name = out_base + '.webp'
        im.save(os.path.join(dest, name), 'WEBP', quality=84)
        return name
    except ImportError:
        name = out_base + os.path.splitext(src)[1].lower()
        shutil.copy(src, os.path.join(dest, name))
        print('   (tip: run  pip install pillow  once, and photos will be made small automatically)')
        return name


def ask_photos(slug, existing=0, folder='products', many=True):
    """Show the newest phone photos; the user picks by number. Returns saved file names."""
    if not os.path.isdir(SHARED):
        print('Termux cannot see your phone storage yet. Run   termux-setup-storage   once, tap Allow, then try again.')
        return []
    items = _all_photos()[:15]
    if not items:
        print('No photos found in DCIM, Pictures or Download.')
        return []
    print('\nYour newest photos:')
    for i, (t, p) in enumerate(items, 1):
        print('  %2d = %s   (%s)' % (i, os.path.basename(p), time.strftime('%d %b %H:%M', time.localtime(t))))
    drain_input()
    while True:
        raw = input('Type the number%s of the photo%s (example: %s), or press Enter to skip: ' % (
            's' if many else '', 's' if many else '', '1,3' if many else '1')).strip()
        parts = [x.strip() for x in raw.split(',') if x.strip()]
        bad = [x for x in parts if not ((x.isdigit() and 1 <= int(x) <= len(items)) or find_photo(x))]
        if bad:
            print('   That is not a photo number or file name: "%s"' % raw[:60])
            drain_input()
            continue
        break
    saved = []
    for part in parts[:(None if many else 1)]:
        src = items[int(part) - 1][1] if part.isdigit() else find_photo(part)
        n = existing + len(saved) + 1
        saved.append(save_photo(src, slug if n == 1 else '%s-%d' % (slug, n), folder))
        print('   photo saved: %s' % saved[-1])
    return saved


def rebuild_sitemap(prods):
    path = os.path.join(REPO, 'sitemap.xml')
    try:
        text = open(path, encoding='utf-8').read()
    except OSError:
        return
    text = re.sub(r'\s*<url><loc>[^<]*product\.html\?slug=[^<]*</loc></url>', '', text)
    blocks = ''.join('  <url><loc>%s/product.html?slug=%s</loc></url>\n' % (ORIGIN, p['slug'])
                     for p in prods if p.get('slug') and p.get('status') in (None, 'published'))
    text = text.replace('</urlset>', blocks + '</urlset>')
    open(path, 'w', encoding='utf-8').write(text)
