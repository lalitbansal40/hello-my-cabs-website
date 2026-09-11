#!/usr/bin/env python3
"""
Draws the brand assets that have to exist as real files: public/logo.png,
public/favicon.ico and src/app/apple-icon.png.

Why a script and not a design export: these three are the same mark as src/app/icon.svg —
two points and the road between them — and if they are drawn by hand they drift apart. The
logo in particular is named in the Organization structured data, where it was pointing at a
URL that returned 404; a logo a crawler cannot fetch is a logo that cannot appear beside
the company's name.

Run after changing icon.svg:  python3 scripts/brand/make-icons.py

Needs Pillow. The output files are committed, so this does not run in the build.
"""

from PIL import Image, ImageDraw

FOREST = (11, 44, 34)  # #0B2C22 — the same ground the site's dark sections use
ACCENT = (0, 194, 110)  # #00C26E

# The mark in the 32-unit space of icon.svg, before its translate(2.5,2.5) scale(0.84).
CURVE = [
    ((6, 24), (6, 17), (10, 14), (16, 14)),
    ((16, 14), (22, 14), (26, 11), (26, 4)),
]
START = (6, 24)  # filled point
END = (26, 4)  # hollow point


def bezier(p0, p1, p2, p3, steps):
    """Cubic bezier, sampled. Enough points that the road reads as a curve at 512px."""
    out = []
    for i in range(steps + 1):
        t = i / steps
        u = 1 - t
        x = u**3 * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t**3 * p3[0]
        y = u**3 * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t**3 * p3[1]
        out.append((x, y))
    return out


def draw_mark(size, *, background=True, scale_factor=4):
    """The mark at `size` px. Drawn 4× and resized down — Pillow has no antialiasing."""
    s = size * scale_factor
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    unit = s / 32  # the SVG's coordinate space

    if background:
        d.rounded_rectangle([0, 0, s - 1, s - 1], radius=int(8 * unit), fill=FOREST)

    def place(p):
        """icon.svg applies translate(2.5,2.5) scale(0.84) to the whole mark."""
        return ((2.5 + 0.84 * p[0]) * unit, (2.5 + 0.84 * p[1]) * unit)

    # The road: dots along the curve, the way the favicon draws it.
    points = []
    for seg in CURVE:
        points += bezier(*seg, steps=140)
    dot_r = 0.55 * 0.84 * unit
    step = max(1, len(points) // 13)
    for i in range(step, len(points) - step, step):
        x, y = place(points[i])
        d.ellipse([x - dot_r, y - dot_r, x + dot_r, y + dot_r], fill=ACCENT)

    # Where you are: filled. Where you are going: an outline.
    x, y = place(START)
    r = 3.6 * 0.84 * unit
    d.ellipse([x - r, y - r, x + r, y + r], fill=ACCENT)

    x, y = place(END)
    r = 3.6 * 0.84 * unit
    w = 2.6 * 0.84 * unit
    d.ellipse([x - r, y - r, x + r, y + r], outline=ACCENT, width=int(round(w)))

    return img.resize((size, size), Image.LANCZOS)


def main():
    # Organization.logo — Google asks for at least 112px; 512 gives it room to be reused.
    draw_mark(512).convert("RGB").save("public/logo.png", optimize=True)

    # The tab icon. 16/32/48 in one file, because Google reads 48 and browsers read 16.
    draw_mark(256).save(
        "public/favicon.ico", sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128)]
    )

    # iOS home screen: no transparency, no rounding of its own — the system rounds it.
    draw_mark(180).convert("RGB").save("src/app/apple-icon.png", optimize=True)

    print("wrote public/logo.png, public/favicon.ico, src/app/apple-icon.png")


if __name__ == "__main__":
    main()
