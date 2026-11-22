#!/usr/bin/env python3
"""Une las 6 imágenes de pitch en un PDF comprimido (JPEG ~82%, ancho máx. 1920)."""

from __future__ import annotations

import io
import sys
from pathlib import Path

from PIL import Image
import img2pdf

ROOT = Path(__file__).resolve().parent.parent
SLIDES_DIR = ROOT / "pitch-slides"
ORDER = [
    "pitch-01-cover.jpg",
    "pitch-02-problema.jpg",
    "pitch-03-solucion.jpg",
    "pitch-04-cruce.jpg",
    "pitch-05-flujo.jpg",
    "pitch-06-cierre.jpg",
]
OUT = SLIDES_DIR / "epim-pitch-deck-manabi.pdf"
MAX_WIDTH = 1920
JPEG_QUALITY = 82


def main() -> int:
    compressed: list[bytes] = []
    for name in ORDER:
        src = SLIDES_DIR / name
        if not src.is_file():
            print(f"Falta: {src}", file=sys.stderr)
            return 1
        im = Image.open(src)
        if im.mode != "RGB":
            im = im.convert("RGB")
        w, h = im.size
        if w > MAX_WIDTH:
            im = im.resize((MAX_WIDTH, int(h * MAX_WIDTH / w)), Image.Resampling.LANCZOS)
        buf = io.BytesIO()
        im.save(buf, format="JPEG", quality=JPEG_QUALITY, optimize=True, progressive=True)
        compressed.append(buf.getvalue())

    SLIDES_DIR.mkdir(parents=True, exist_ok=True)
    OUT.write_bytes(img2pdf.convert(compressed))
    mb = OUT.stat().st_size / (1024 * 1024)
    print(f"Guardado: {OUT} ({mb:.2f} MB)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())