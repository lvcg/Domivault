from __future__ import annotations

import math
import os
from pathlib import Path
from typing import Iterable, NamedTuple

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
SCREENSHOTS = ROOT / "public" / "screenshots"
LOGO = ROOT / "public" / "logo512.png"
OUTPUT = ROOT / "play_store_assets"

MAX_FEATURE_BYTES = 15 * 1024 * 1024
MAX_SCREENSHOT_BYTES = 8 * 1024 * 1024

SLATE_950 = (2, 6, 23)
SLATE_900 = (15, 23, 42)
SLATE_800 = (30, 41, 59)
SLATE_700 = (51, 65, 85)
EMERALD_500 = (16, 185, 129)
EMERALD_300 = (110, 231, 183)
WHITE = (248, 250, 252)
MUTED = (203, 213, 225)


class AssetSpec(NamedTuple):
    slug: str
    title: str
    subtitle: str
    screenshot: str


PHONE_SPECS = [
    AssetSpec("dashboard", "Command your home", "Track appliances, tasks, and records from one dashboard.", "domivault-dashboard.png"),
    AssetSpec("expenses", "Know every cost", "Organize expenses, bills, projects, and spending trends.", "domivault-expenses.png"),
    AssetSpec("warranties", "Keep proof ready", "Store warranties, receipts, appliance records, and alerts.", "domivault-appliances.png"),
    AssetSpec("reports", "Export home records", "Create clean reports for repairs, planning, and documentation.", "domivault-reports.png"),
]

TABLET_SPECS = PHONE_SPECS


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        Path(os.environ.get("WINDIR", "C:/Windows")) / "Fonts" / ("segoeuib.ttf" if bold else "segoeui.ttf"),
        Path(os.environ.get("WINDIR", "C:/Windows")) / "Fonts" / ("arialbd.ttf" if bold else "arial.ttf"),
    ]
    for candidate in candidates:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size=size)
    return ImageFont.load_default()


def ensure_dirs() -> None:
    for folder in ["feature_graphic", "phone", "tablet_7in", "tablet_10in"]:
        (OUTPUT / folder).mkdir(parents=True, exist_ok=True)


def gradient(size: tuple[int, int]) -> Image.Image:
    width, height = size
    small = Image.new("RGB", (64, 64), SLATE_950)
    pixels = small.load()
    for y in range(64):
        ny = y / 63
        for x in range(64):
            nx = x / 63
            glow = max(0.0, 1.0 - math.sqrt((nx - 0.75) ** 2 + (ny - 0.32) ** 2) * 1.6)
            pixels[x, y] = (
                min(255, int(SLATE_950[0] + (SLATE_900[0] - SLATE_950[0]) * ny + EMERALD_500[0] * glow * 0.12)),
                min(255, int(SLATE_950[1] + (SLATE_900[1] - SLATE_950[1]) * ny + EMERALD_500[1] * glow * 0.16)),
                min(255, int(SLATE_950[2] + (SLATE_900[2] - SLATE_950[2]) * ny + EMERALD_500[2] * glow * 0.10)),
            )

    image = small.resize(size, Image.Resampling.BICUBIC)
    glow_layer = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(glow_layer, "RGBA")
    draw.ellipse(
        (int(width * 0.48), int(height * -0.10), int(width * 1.12), int(height * 0.70)),
        fill=(16, 185, 129, 42),
    )
    return Image.alpha_composite(image.convert("RGBA"), glow_layer.filter(ImageFilter.GaussianBlur(max(42, width // 16)))).convert("RGB")


def fit_cover(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    image = image.convert("RGB")
    target_w, target_h = size
    scale = max(target_w / image.width, target_h / image.height)
    resized = image.resize((math.ceil(image.width * scale), math.ceil(image.height * scale)), Image.Resampling.LANCZOS)
    left = (resized.width - target_w) // 2
    top = (resized.height - target_h) // 2
    return resized.crop((left, top, left + target_w, top + target_h))


def fit_contain(image: Image.Image, size: tuple[int, int], fill: tuple[int, int, int] = SLATE_900) -> Image.Image:
    image = image.convert("RGB")
    target_w, target_h = size
    scale = min(target_w / image.width, target_h / image.height)
    resized = image.resize((max(1, int(image.width * scale)), max(1, int(image.height * scale))), Image.Resampling.LANCZOS)
    output = Image.new("RGB", size, fill)
    output.paste(resized, ((target_w - resized.width) // 2, (target_h - resized.height) // 2))
    return output


def redact_private_screenshot_text(image: Image.Image, screenshot_name: str) -> Image.Image:
    """Mask demo account identifiers before screenshots are used in store assets."""
    if screenshot_name != "domivault-dashboard.png":
        return image

    output = image.convert("RGB").copy()
    draw = ImageDraw.Draw(output, "RGBA")

    # Source dashboard screenshot is 1440x1000. Scale the known profile name
    # region so this remains stable if the source image is regenerated.
    scale_x = output.width / 1440
    scale_y = output.height / 1000
    box = (
        int(392 * scale_x),
        int(66 * scale_y),
        int(770 * scale_x),
        int(116 * scale_y),
    )
    radius = max(10, int(14 * min(scale_x, scale_y)))

    draw.rounded_rectangle(box, radius=radius, fill=(248, 250, 252, 255))
    draw.text(
        (box[0], box[1] + int(5 * scale_y)),
        "DomiVault User",
        font=font(max(28, int(38 * min(scale_x, scale_y))), bold=True),
        fill=SLATE_950,
    )
    return output


def rounded_mask(size: tuple[int, int], radius: int) -> Image.Image:
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle((0, 0, size[0], size[1]), radius=radius, fill=255)
    return mask


def paste_rounded(base: Image.Image, image: Image.Image, xy: tuple[int, int], radius: int) -> None:
    mask = rounded_mask(image.size, radius)
    base.paste(image, xy, mask)


def draw_text(draw: ImageDraw.ImageDraw, xy: tuple[int, int], text: str, size: int, fill=WHITE, bold=False, anchor=None) -> None:
    draw.text(xy, text, font=font(size, bold=bold), fill=fill, anchor=anchor)


def draw_wrapped(
    draw: ImageDraw.ImageDraw,
    xy: tuple[int, int],
    text: str,
    max_width: int,
    size: int,
    fill=MUTED,
    bold: bool = False,
    line_gap: int = 8,
) -> int:
    words = text.split()
    lines: list[str] = []
    current = ""
    text_font = font(size, bold=bold)
    for word in words:
        candidate = f"{current} {word}".strip()
        if draw.textbbox((0, 0), candidate, font=text_font)[2] <= max_width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)

    x, y = xy
    for line in lines:
        draw.text((x, y), line, font=text_font, fill=fill)
        y += size + line_gap
    return y


def add_logo(draw: ImageDraw.ImageDraw, base: Image.Image, xy: tuple[int, int], size: int) -> None:
    if LOGO.exists():
        icon = Image.open(LOGO).convert("RGBA").resize((size, size), Image.Resampling.LANCZOS)
        base.paste(icon, xy, icon)
    draw_text(draw, (xy[0] + size + 18, xy[1] + size // 2), "DomiVault", size=max(30, size // 2), bold=True, anchor="lm")


def draw_mock_device(base: Image.Image, screenshot_name: str, box: tuple[int, int, int, int], radius: int, padding: int) -> None:
    draw = ImageDraw.Draw(base, "RGBA")
    x1, y1, x2, y2 = box
    width = x2 - x1
    height = y2 - y1

    shadow = Image.new("RGBA", base.size, (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow, "RGBA")
    shadow_draw.rounded_rectangle((x1 + 18, y1 + 24, x2 + 18, y2 + 24), radius=radius, fill=(0, 0, 0, 120))
    base.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(24)))

    draw.rounded_rectangle(box, radius=radius, fill=(12, 18, 32, 255), outline=(80, 105, 125, 180), width=4)
    inner = (x1 + padding, y1 + padding, x2 - padding, y2 - padding)
    src = redact_private_screenshot_text(Image.open(SCREENSHOTS / screenshot_name), screenshot_name)
    shot = fit_cover(src, (inner[2] - inner[0], inner[3] - inner[1]))
    paste_rounded(base, shot, (inner[0], inner[1]), max(18, radius - padding))
    draw.rounded_rectangle(inner, radius=max(18, radius - padding), outline=(255, 255, 255, 38), width=2)
    draw.rounded_rectangle((x1 + width * 0.36, y1 + 14, x1 + width * 0.64, y1 + 24), radius=8, fill=(148, 163, 184, 120))


def create_feature_graphic() -> Path:
    size = (1024, 500)
    base = gradient(size).convert("RGBA")
    draw = ImageDraw.Draw(base, "RGBA")

    draw.ellipse((610, -120, 1180, 520), outline=(16, 185, 129, 70), width=5)
    draw.rounded_rectangle((42, 52, 442, 430), radius=42, fill=(15, 23, 42, 170), outline=(148, 163, 184, 50), width=2)
    add_logo(draw, base, (78, 82), 72)
    draw_text(draw, (82, 202), "Home Command Center", 48, bold=True)
    draw_text(draw, (82, 260), "& Records Vault", 48, fill=EMERALD_300, bold=True)
    draw_wrapped(draw, (84, 334), "Track maintenance, receipts, warranties, expenses, and reports in one secure place.", 330, 24)

    draw_mock_device(base, "domivault-dashboard.png", (492, 70, 958, 430), radius=34, padding=18)
    draw.rounded_rectangle((548, 348, 842, 408), radius=24, fill=(16, 185, 129, 42), outline=(110, 231, 183, 80), width=2)
    draw_text(draw, (582, 378), "Secure home records", 24, fill=WHITE, bold=True, anchor="lm")

    output = OUTPUT / "feature_graphic" / "domivault-feature-graphic-1024x500.png"
    base.convert("RGB").save(output, optimize=True, quality=95)
    return output


def create_portrait_asset(folder: str, spec: AssetSpec, canvas_size: tuple[int, int], device_box: tuple[int, int, int, int]) -> Path:
    base = gradient(canvas_size).convert("RGBA")
    draw = ImageDraw.Draw(base, "RGBA")
    width, _ = canvas_size

    add_logo(draw, base, (70, 72), 74 if width <= 1200 else 96)
    title_size = 58 if width <= 1200 else 78
    sub_size = 28 if width <= 1200 else 38
    draw_text(draw, (70, 210 if width <= 1200 else 260), spec.title, title_size, bold=True)
    draw_wrapped(draw, (72, 286 if width <= 1200 else 360), spec.subtitle, width - 144, sub_size, fill=MUTED, line_gap=10)

    draw_mock_device(base, spec.screenshot, device_box, radius=56 if width <= 1200 else 74, padding=18 if width <= 1200 else 26)

    out = OUTPUT / folder / f"domivault-{spec.slug}-{canvas_size[0]}x{canvas_size[1]}.png"
    base.convert("RGB").save(out, optimize=True, quality=95)
    return out


def create_phone_assets() -> list[Path]:
    return [
        create_portrait_asset("phone", spec, (1080, 1920), (116, 500, 964, 1790))
        for spec in PHONE_SPECS
    ]


def create_tablet_7_assets() -> list[Path]:
    return [
        create_portrait_asset("tablet_7in", spec, (1200, 1920), (110, 480, 1090, 1760))
        for spec in TABLET_SPECS
    ]


def create_tablet_10_assets() -> list[Path]:
    return [
        create_portrait_asset("tablet_10in", spec, (1600, 2560), (130, 620, 1470, 2380))
        for spec in TABLET_SPECS
    ]


def validate(paths: Iterable[Path]) -> None:
    print("\nGoogle Play asset validation")
    print("-" * 96)
    for path in paths:
        with Image.open(path) as image:
            width, height = image.size
        size_bytes = path.stat().st_size
        limit = MAX_FEATURE_BYTES if "feature_graphic" in path.parts else MAX_SCREENSHOT_BYTES
        ratio = width / height
        status = "PASS" if size_bytes <= limit else "FAIL"
        print(
            f"{status} | {path.relative_to(ROOT)} | {width}x{height} | "
            f"ratio {ratio:.4f} | {size_bytes / 1024 / 1024:.2f} MB"
        )


def main() -> None:
    ensure_dirs()
    outputs = [
        create_feature_graphic(),
        *create_phone_assets(),
        *create_tablet_7_assets(),
        *create_tablet_10_assets(),
    ]
    validate(outputs)
    print(f"\nSaved {len(outputs)} assets to: {OUTPUT}")


if __name__ == "__main__":
    main()
