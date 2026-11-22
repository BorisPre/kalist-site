"""One-off image preparation (needs Pillow): python3 scripts/images.py ../KALIST
Photo, app screenshots and icons, resized and encoded as WebP/PNG into assets/img/."""
import sys
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
app = Path(sys.argv[1] if len(sys.argv) > 1 else root / '../KALIST').resolve()
out = root / 'assets/img'
out.mkdir(parents=True, exist_ok=True)

hero = Image.open(app / 'dist/assets/athlete.png').convert('RGB')
for width in (1600, 960):
    h = round(hero.height * width / hero.width)
    hero.resize((width, h), Image.LANCZOS).save(out / f'hero-{width}.webp', quality=78, method=6)

shots = {'parcours': '01-parcours', 'mouvement': '03-mouvement', 'programme': '05-programme', 'progression': '06-progression', 'coach': '08-coach'}
for lang in ('fr', 'en'):
    for name, file in shots.items():
        im = Image.open(app / f'store/screenshots/google-play-phone/{lang}/{file}.png').convert('RGB')
        im.resize((600, round(im.height * 600 / im.width)), Image.LANCZOS).save(out / f'app-{lang}-{name}.webp', quality=80, method=6)

icon = Image.open(app / 'store/app-store/icon-1024.png').convert('RGB')
icon.resize((180, 180), Image.LANCZOS).save(out / 'apple-touch-icon.png', optimize=True)
icon.resize((512, 512), Image.LANCZOS).save(out / 'icon-512.png', optimize=True)
icon.resize((32, 32), Image.LANCZOS).save(out / 'favicon-32.png', optimize=True)
print('images prêtes dans', out)
