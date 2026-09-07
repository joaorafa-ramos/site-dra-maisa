from pathlib import Path

from PIL import Image, ImageChops


ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / "logo-maisa-hires.png"
OUTPUT = ROOT / "logo-maisa-transparent.png"
PREVIEW = ROOT / "logo-maisa-on-beige.png"

BACKGROUND = (249, 250, 249)
INK = (20, 51, 85)
BEIGE = (239, 231, 218)


image = Image.open(SOURCE).convert("RGB")
background = Image.new("RGB", image.size, BACKGROUND)
difference = ImageChops.difference(image, background)

# Convert the paper/anti-alias transition into a smooth alpha channel while
# keeping the brand's original deep-blue ink consistent.
alpha = difference.convert("L").point(lambda value: min(255, value * 3))
bbox = alpha.point(lambda value: 255 if value > 5 else 0).getbbox()
if bbox is None:
    raise RuntimeError("No logo artwork was detected in the rendered PDF.")

left, top, right, bottom = bbox
padding = round(max(right - left, bottom - top) * 0.035)
left = max(0, left - padding)
top = max(0, top - padding)
right = min(image.width, right + padding)
bottom = min(image.height, bottom + padding)

cropped_alpha = alpha.crop((left, top, right, bottom))
logo = Image.new("RGBA", cropped_alpha.size, (*INK, 0))
logo.putalpha(cropped_alpha)
logo.save(OUTPUT, optimize=True)

preview = Image.new("RGBA", logo.size, (*BEIGE, 255))
preview.alpha_composite(logo)
preview.convert("RGB").save(PREVIEW, optimize=True)

print(f"output={OUTPUT}")
print(f"size={logo.width}x{logo.height}")
print(f"bbox={(left, top, right, bottom)}")
