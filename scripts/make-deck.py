"""Genere le deck de presentation de Spindown Codex.

Theme aligne sur le site : fond brun-noir, parchemin, or, sang.
Sortie : docs/Spindown-Codex.pptx
"""

from pathlib import Path

from PIL import Image
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.oxml.ns import qn
from pptx.util import Emu, Inches, Pt

ROOT = Path(__file__).resolve().parent.parent
SHOTS = ROOT / "docs" / "shots"
OUT = ROOT / "docs" / "Spindown-Codex.pptx"

BG = RGBColor(0x04, 0x12, 0x1A)
CARD = RGBColor(0x0A, 0x2A, 0x36)
INK = RGBColor(0xE9, 0xF7, 0xFB)
DIM = RGBColor(0xA9, 0xC9, 0xD4)
FAINT = RGBColor(0x6D, 0x94, 0xA2)
GOLD = RGBColor(0x4F, 0xD8, 0xE8)
GOLDDIM = RGBColor(0x2A, 0xA8, 0xC4)
BLOOD = RGBColor(0xD0, 0x45, 0x3C)
OLIVE = RGBColor(0x9B, 0xE3, 0x56)

TITLE_FONT = "Bahnschrift"
BODY_FONT = "Arial"

SLIDE_W = Inches(13.333)
SLIDE_H = Inches(7.5)
MARGIN = Inches(0.85)


def add_slide(prs):
    return prs.slides.add_slide(prs.slide_layouts[6])


def paint_bg(slide):
    """Fond plein cadre."""
    bg = slide.shapes.add_shape(1, 0, 0, SLIDE_W, SLIDE_H)
    bg.fill.solid()
    bg.fill.fore_color.rgb = BG
    bg.line.fill.background()
    bg.shadow.inherit = False
    send_to_back(bg)
    return bg


def send_to_back(shape):
    tree = shape._element.getparent()
    tree.remove(shape._element)
    tree.insert(2, shape._element)


def rule(slide, x, y, w, color=GOLDDIM, h=Pt(2)):
    bar = slide.shapes.add_shape(1, x, y, w, h)
    bar.fill.solid()
    bar.fill.fore_color.rgb = color
    bar.line.fill.background()
    bar.shadow.inherit = False
    return bar


def textbox(slide, x, y, w, h, *, anchor=MSO_ANCHOR.TOP):
    box = slide.shapes.add_textbox(x, y, w, h)
    tf = box.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = anchor
    tf.margin_left = 0
    tf.margin_right = 0
    tf.margin_top = 0
    tf.margin_bottom = 0
    return tf


def write(tf, text, *, size, color, font=BODY_FONT, bold=False, first=False, space_before=0,
          line=1.15, caps=False):
    p = tf.paragraphs[0] if first else tf.add_paragraph()
    p.line_spacing = line
    p.space_before = Pt(space_before)
    run = p.add_run()
    run.text = text.upper() if caps else text
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.name = font
    run.font.color.rgb = color
    return p


def header(slide, kicker, title, *, kicker_color=GOLD):
    tf = textbox(slide, MARGIN, Inches(0.5), Inches(11.6), Inches(0.35))
    write(tf, kicker, size=11, color=kicker_color, font=TITLE_FONT, first=True, caps=True)
    tf2 = textbox(slide, MARGIN, Inches(0.92), Inches(11.6), Inches(0.9))
    write(tf2, title, size=32, color=INK, font=TITLE_FONT, first=True, line=1.0)


def footer(slide, n):
    tf = textbox(slide, MARGIN, Inches(6.92), Inches(9), Inches(0.3))
    write(tf, "Spindown Codex  ·  projet fan non officiel  ·  The Binding of Isaac: Repentance+",
          size=9, color=FAINT, first=True)
    tf2 = textbox(slide, Inches(12.0), Inches(6.92), Inches(0.5), Inches(0.3))
    p = write(tf2, f"{n:02d}", size=10, color=GOLDDIM, font=TITLE_FONT, first=True)
    p.alignment = PP_ALIGN.RIGHT


def bullets(slide, items, *, x=MARGIN, y=Inches(2.1), w=Inches(11.4), size=17, gap=14):
    y_cursor = y
    for text, color in items:
        bar = slide.shapes.add_shape(1, x, y_cursor + Pt(7), Pt(3), Pt(14))
        bar.fill.solid()
        bar.fill.fore_color.rgb = GOLDDIM
        bar.line.fill.background()
        bar.shadow.inherit = False

        tf = textbox(slide, x + Inches(0.28), y_cursor, w - Inches(0.28), Inches(0.7))
        write(tf, text, size=size, color=color, first=True, line=1.25)
        y_cursor += Emu(int(Inches(0.62)) * 0 + Inches(0.62)) if False else Inches(0.62)
        y_cursor += Pt(gap) - Inches(0.62) if False else 0
    return y_cursor


def fit_image(path, max_w, max_h):
    with Image.open(path) as im:
        w, h = im.size
    ratio = min(max_w / w, max_h / h)
    return int(w * ratio), int(h * ratio)


def picture_slide(prs, n, kicker, title, image, blurb):
    """Capture a droite, texte a gauche : une image 3:2 ne remplit jamais un 16:9."""
    slide = add_slide(prs)
    paint_bg(slide)
    header(slide, kicker, title)

    text_w = Inches(3.85)
    tf = textbox(slide, MARGIN, Inches(2.15), text_w, Inches(2.4))
    write(tf, blurb, size=13.5, color=DIM, first=True, line=1.55)

    max_w, max_h = Inches(7.35), Inches(4.62)
    w, h = fit_image(image, max_w, max_h)
    x = int(Inches(5.35) + (max_w - w) / 2)
    y = int(Inches(1.95) + (max_h - h) / 2)

    frame = slide.shapes.add_shape(1, x - Inches(0.07), y - Inches(0.07),
                                   w + Inches(0.14), h + Inches(0.14))
    frame.fill.solid()
    frame.fill.fore_color.rgb = CARD
    frame.line.color.rgb = GOLDDIM
    frame.line.width = Pt(1)
    frame.shadow.inherit = False

    slide.shapes.add_picture(str(image), x, y, w, h)
    footer(slide, n)
    return slide


def set_cell_border(cell, color, width_pt=0.75):
    """Bordures fines : le quadrillage blanc par defaut jure sur un fond sombre."""
    tcPr = cell._tc.get_or_add_tcPr()
    for tag in ('a:lnL', 'a:lnR', 'a:lnT', 'a:lnB'):
        for el in tcPr.findall(qn(tag)):
            tcPr.remove(el)
    for index, tag in enumerate(('a:lnL', 'a:lnR', 'a:lnT', 'a:lnB')):
        ln = tcPr.makeelement(qn(tag), {})
        ln.set('w', str(int(width_pt * 12700)))
        ln.set('cap', 'flat')
        ln.set('cmpd', 'sng')
        ln.set('algn', 'ctr')
        fill = tcPr.makeelement(qn('a:solidFill'), {})
        clr = tcPr.makeelement(qn('a:srgbClr'), {})
        clr.set('val', color)
        fill.append(clr)
        ln.append(fill)
        tcPr.insert(index, ln)


def build():
    prs = Presentation()
    prs.slide_width = SLIDE_W
    prs.slide_height = SLIDE_H

    # ---------------------------------------------------------- 1. titre
    s = add_slide(prs)
    paint_bg(s)
    tf = textbox(s, MARGIN, Inches(2.05), Inches(11.6), Inches(0.4))
    write(tf, "encyclopédie  ·  outil  ·  projet fan", size=12, color=BLOOD,
          font=TITLE_FONT, first=True, caps=True)

    tf = textbox(s, MARGIN, Inches(2.55), Inches(11.6), Inches(1.3))
    write(tf, "Spindown Codex", size=62, color=INK, font=TITLE_FONT, first=True, line=1.0)

    rule(s, MARGIN, Inches(3.95), Inches(2.2), GOLD, Pt(3))

    tf = textbox(s, MARGIN, Inches(4.3), Inches(10.4), Inches(0.9))
    write(tf, "Ce que chaque item devient.", size=26, color=GOLD, font=TITLE_FONT, first=True)

    tf = textbox(s, MARGIN, Inches(5.15), Inches(9.6), Inches(1.2))
    write(tf, "721 collectibles de Repentance+, une chaîne continue, et l'information que les autres "
              "wikis ne donnent pas : la marche suivante.",
          size=15, color=DIM, first=True, line=1.4)

    tf = textbox(s, MARGIN, Inches(6.6), Inches(11.6), Inches(0.4))
    write(tf, "Projet fan non officiel, non affilié à Edmund McMillen, Nicalis ou Valve. "
              "Gratuit, sans publicité, sans monétisation.",
          size=10, color=FAINT, first=True)
    s.notes_slide.notes_text_frame.text = (
        "Accroche : le site ne répond pas seulement à « c'est quoi cet item », "
        "mais à « ça devient quoi »."
    )

    # ------------------------------------------------------- 2. le manque
    s = add_slide(prs)
    paint_bg(s)
    header(s, "le point de départ", "Ce que les wikis ne montrent pas")
    bullets(s, [
        ("« C'est quoi cet item ? » — tout le monde y répond.", INK),
        ("« Ça devient quoi avec un Spindown ? » — presque personne.", INK),
        ("Et jamais : « et si j'enchaîne, où est-ce que j'atterris ? »", GOLD),
    ], y=Inches(2.2), size=19)
    tf = textbox(s, MARGIN, Inches(4.9), Inches(11.2), Inches(1.2))
    write(tf, "La relation Spindown est linéaire : un seul successeur, un seul prédécesseur. "
              "C'est un escalier, pas un graphe. Il suffisait de le dessiner comme tel.",
          size=15, color=DIM, first=True, line=1.45)
    footer(s, 2)
    s.notes_slide.notes_text_frame.text = (
        "C'est la phrase de l'utilisateur : « si on cherche un item y'aura pas la suite du spindown ». "
        "Tout le projet part de là."
    )

    # --------------------------------------------------- 3. accueil
    picture_slide(prs, 3, "le site", "Une encyclopédie, et un escalier",
                  SHOTS / "home.png",
                  "L'accueil sert de rampe : un seul champ de recherche, 20 langues indexées, "
                  "et la règle expliquée en trois temps.")

    # --------------------------------------------------- 4. la chaîne
    picture_slide(prs, 4, "l'écran central", "La chaîne entière, d'un bout à l'autre",
                  SHOTS / "chain.png",
                  "Toute la chaîne d'un seul tenant, avec un rail de position à droite. "
                  "Dad's Note y est signalée par un badge : elle ne peut pas être rerollée.")

    # --------------------------------------------------- 5. la fiche
    picture_slide(prs, 5, "le cœur du site", "La fiche est une marche",
                  SHOTS / "item-detail.png",
                  "Ce que l'item devient, ce qui mène à lui, et le contexte autour. On continue à "
                  "descendre sans repasser par un index.")

    # --------------------------------------------------- 6. recherche
    picture_slide(prs, 6, "recherche", "Chercher dans 20 langues",
                  SHOTS / "search.png",
                  "« 悲しみオニオン » mène à The Sad Onion. Le contenu reste en anglais, "
                  "l'accès est multilingue — et le CJK passe, faute de tokenisation.")

    # --------------------------------------------------- 7. calculateur
    picture_slide(prs, 7, "calculateur", "Combien de Spindowns ?",
                  SHOTS / "calculator.png",
                  "Distance exacte entre deux items, Car Battery compris. Et quand c'est impossible, "
                  "le site dit pourquoi au lieu de renvoyer zéro.")

    # --------------------------------------------------- 8. corrections
    s = add_slide(prs)
    paint_bg(s)
    header(s, "vérification", "Ce que les fichiers du jeu ont corrigé")

    rows = [
        ("Ce qui était supposé", "Ce que disent items.xml et le wiki"),
        ("Le pool décide de la cible", "Non : seul l'état de déblocage compte"),
        ("Les non-collectibles sont sautés", "4 items « hidden », et c'est tout"),
        ("Mom's Ring ne peut pas être reroll", "Elle est inatteignable, pas bloquée"),
        ("Environ 720 items", "721, avec 11 IDs vides"),
    ]
    shape = s.shapes.add_table(len(rows), 2, MARGIN, Inches(2.15), Inches(11.4), Inches(3.3))
    table = shape.table
    table.columns[0].width = Inches(4.9)
    table.columns[1].width = Inches(6.5)

    for r, (left, right) in enumerate(rows):
        for c, value in enumerate((left, right)):
            cell = table.cell(r, c)
            cell.fill.solid()
            cell.fill.fore_color.rgb = CARD if r else BG
            set_cell_border(cell, "1E5666")
            cell.margin_left = Inches(0.14)
            cell.margin_top = Inches(0.08)
            cell.margin_bottom = Inches(0.08)
            cell.vertical_anchor = MSO_ANCHOR.MIDDLE
            tf = cell.text_frame
            tf.word_wrap = True
            p = tf.paragraphs[0]
            run = p.add_run()
            run.text = value
            run.font.size = Pt(13 if r else 12)
            run.font.name = BODY_FONT
            run.font.bold = r == 0
            run.font.color.rgb = DIM if r == 0 else (DIM if c == 0 else INK)
            if c == 1 and r > 0:
                run.font.color.rgb = GOLD

    tf = textbox(s, MARGIN, Inches(5.75), Inches(11.2), Inches(0.9))
    write(tf, "Croisé sur deux sources indépendantes, puis validé contre les fichiers du jeu eux-mêmes. "
              "Aucune donnée inventée : ce qui manque est explicitement nul.",
          size=13, color=DIM, first=True, line=1.4)
    footer(s, 8)
    s.notes_slide.notes_text_frame.text = (
        "Point le plus important de la présentation : le brief initial se trompait sur la règle."
    )

    # --------------------------------------------------- 9. chiffres
    s = add_slide(prs)
    paint_bg(s)
    header(s, "sous le capot", "Ce que ça pèse, et ce que ça coûte")

    stats = [
        ("721", "collectibles\n(717 visibles)"),
        ("722", "pages statiques\nbuild en 1,5 s"),
        ("38", "tests\ntous verts"),
        ("20", "langues\ndans la recherche"),
        ("5", "langues\nd'interface"),
        ("0", "requête\nvers un tiers"),
    ]
    col_w = Inches(3.55)
    row_h = Inches(1.75)
    for i, (num, label) in enumerate(stats):
        cx = MARGIN + (col_w + Inches(0.25)) * (i % 3)
        cy = Inches(2.2) + row_h * (i // 3)

        card = s.shapes.add_shape(1, cx, cy, col_w, Inches(1.45))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD
        card.line.color.rgb = GOLDDIM
        card.line.width = Pt(1)
        card.shadow.inherit = False

        tf = textbox(s, cx + Inches(0.25), cy + Inches(0.18), col_w - Inches(0.5), Inches(0.7))
        write(tf, num, size=34, color=GOLD, font=TITLE_FONT, first=True)

        tf = textbox(s, cx + Inches(0.25), cy + Inches(0.85), col_w - Inches(0.5), Inches(0.5))
        write(tf, label, size=11, color=DIM, first=True, line=1.25)

    footer(s, 9)

    # --------------------------------------------------- 10. limites
    s = add_slide(prs)
    paint_bg(s)
    header(s, "honnêteté", "Ce que le site ne fait pas")
    bullets(s, [
        ("Les 721 descriptions sont vérifiées une par une contre le nom de l'item.", DIM),
        ("Pas de trinkets, cartes ni pilules : ils ne sont pas dans la chaîne.", DIM),
        ("Pas de conditions de déblocage : le site parle de la chaîne, pas du 100 %.", DIM),
        ("Le SEO reste anglais : l'interface se traduit à l'exécution, pas les URLs.", DIM),
    ], y=Inches(2.2), size=16)
    footer(s, 10)
    s.notes_slide.notes_text_frame.text = (
        "Assumer les manques fait partie du travail : la fiche l'affiche au lieu de laisser croire à un oubli."
    )

    # --------------------------------------------------- 11. fin
    s = add_slide(prs)
    paint_bg(s)
    tf = textbox(s, MARGIN, Inches(2.3), Inches(11.6), Inches(0.4))
    write(tf, "la suite", size=12, color=BLOOD, font=TITLE_FONT, first=True, caps=True)

    tf = textbox(s, MARGIN, Inches(2.8), Inches(11.6), Inches(1.1))
    write(tf, "Un calculateur qui connaît ta sauvegarde.", size=38, color=INK,
          font=TITLE_FONT, first=True, line=1.1)

    tf = textbox(s, MARGIN, Inches(4.15), Inches(10.2), Inches(1.4))
    write(tf, "En jeu, Spindown saute aussi les items que tu n'as pas débloqués : "
              "ta chaîne réelle est plus courte que celle du site. L'architecture est déjà prête — "
              "il suffit de filtrer avant de calculer.",
          size=15, color=DIM, first=True, line=1.45)

    rule(s, MARGIN, Inches(5.9), Inches(2.2), GOLD, Pt(3))
    tf = textbox(s, MARGIN, Inches(6.1), Inches(11.6), Inches(0.4))
    write(tf, "Merci.", size=22, color=GOLD, font=TITLE_FONT, first=True)
    footer(s, 11)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    prs.save(OUT)
    print(f"{OUT}  ({len(prs.slides.__iter__.__self__._sldIdLst)} diapos, {OUT.stat().st_size // 1024} Ko)")


if __name__ == "__main__":
    build()
