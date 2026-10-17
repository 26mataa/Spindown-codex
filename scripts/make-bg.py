"""Genere la tuile de fond : un carrelage de cave en pixel-art.

Palette d'Isaac : brun tres sombre, ocre, sang seche.
La tuile doit etre raccordable (briques decalees, bords qui bouclent).
Sortie : public/bg/cellar.png
"""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "bg" / "cellar.png"

SIZE = 96  # 6 briques de 16 px
BRICK_H = 16
BRICK_W = 32
OFFSET = 16

MORTAR = (20, 14, 12)
FACES = [(52, 27, 22), (60, 33, 26), (45, 23, 19), (56, 30, 24)]
EDGE_LIGHT = (78, 42, 33)
EDGE_DARK = (10, 6, 5)
BLOOD = [(92, 20, 16), (74, 15, 12), (110, 26, 20)]

# Graine fixe : le motif ne doit pas changer d'un build a l'autre.
import random

rng = random.Random(20261017)

img = Image.new("RGB", (SIZE, SIZE), MORTAR)
px = img.load()


def put(x, y, colour):
    px[x % SIZE, y % SIZE] = colour


# Briques
row = 0
y = 0
while y < SIZE:
    shift = OFFSET if row % 2 else 0
    x = -shift
    while x < SIZE:
        face = FACES[rng.randrange(len(FACES))]
        for by in range(BRICK_H - 1):
            for bx in range(BRICK_W - 2):
                # Leger bruit pour casser l'aplat.
                c = face
                if rng.random() < 0.07:
                    c = (face[0] + 6, face[1] + 3, face[2] + 3)
                put(x + bx, y + by, c)
        # Arete haute claire, bas sombre, joint a droite
        for bx in range(BRICK_W - 2):
            put(x + bx, y, EDGE_LIGHT)
            put(x + bx, y + BRICK_H - 2, EDGE_DARK)
        for by in range(BRICK_H - 1):
            put(x + BRICK_W - 2, y + by, EDGE_DARK)
        x += BRICK_W
    y += BRICK_H
    row += 1

# Taches de sang seche, en petits amas de pixels
for _ in range(14):
    cx, cy = rng.randrange(SIZE), rng.randrange(SIZE)
    colour = BLOOD[rng.randrange(len(BLOOD))]
    for dx in range(rng.randint(2, 4)):
        for dy in range(rng.randint(1, 3)):
            put(cx + dx, cy + dy, colour)
    if rng.random() < 0.35:
        for dx in range(rng.randint(1, 3)):
            put(cx + 6 + dx, cy + 3, BLOOD[1])

OUT.parent.mkdir(parents=True, exist_ok=True)
img.save(OUT, optimize=True)
print(f"{OUT}  ({SIZE}x{SIZE}, {OUT.stat().st_size} octets)")
