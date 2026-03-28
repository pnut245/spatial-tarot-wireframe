#!/usr/bin/env python3
from __future__ import annotations

import csv
import math
from dataclasses import dataclass
from datetime import date, datetime
from pathlib import Path
from typing import Iterable


@dataclass(frozen=True)
class TimelineRow:
    d: date
    org: str
    release: str
    typ: str
    tags: tuple[str, ...]
    notes: str
    source_url: str


def parse_date(value: str) -> date:
    return datetime.strptime(value, "%Y-%m-%d").date()


def read_rows(csv_path: Path) -> list[TimelineRow]:
    with csv_path.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows: list[TimelineRow] = []
        for r in reader:
            tags = tuple(t for t in (r["capability_tags"] or "").split(";") if t)
            rows.append(
                TimelineRow(
                    d=parse_date(r["date"]),
                    org=r["org"],
                    release=r["release"],
                    typ=r["type"],
                    tags=tags,
                    notes=r["notes"],
                    source_url=r["source_url"],
                )
            )
    rows.sort(key=lambda x: (x.d, x.org, x.release))
    return rows


def escape_xml(text: str) -> str:
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
        .replace("'", "&apos;")
    )


def daterange_year_ticks(min_d: date, max_d: date) -> list[date]:
    years = list(range(min_d.year, max_d.year + 1))
    ticks = [date(y, 1, 1) for y in years]
    return [t for t in ticks if min_d <= t <= max_d]


def lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def clamp(x: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, x))


def to_x(d: date, min_d: date, max_d: date, x0: float, x1: float) -> float:
    total = (max_d - min_d).days or 1
    t = (d - min_d).days / total
    return lerp(x0, x1, t)


def palette() -> list[str]:
    # Colorblind-friendly-ish defaults
    return [
        "#1b9e77",
        "#d95f02",
        "#7570b3",
        "#e7298a",
        "#66a61e",
        "#e6ab02",
        "#a6761d",
        "#666666",
    ]


def write_svg(path: Path, content: str) -> None:
    path.write_text(content, encoding="utf-8")


def svg_header(width: int, height: int) -> str:
    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" '
        f'viewBox="0 0 {width} {height}">\n'
        "<style>\n"
        "  .title{font:700 20px ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial;fill:#111;}\n"
        "  .axis{font:12px ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial;fill:#333;}\n"
        "  .label{font:12px ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial;fill:#111;}\n"
        "  .small{font:10px ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial;fill:#222;}\n"
        "  .org{font:600 13px ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial;fill:#111;}\n"
        "</style>\n"
    )


def svg_footer() -> str:
    return "</svg>\n"


def render_timeline_svg(rows: list[TimelineRow]) -> str:
    width, height = 1700, 720
    margin_left, margin_right = 180, 30
    margin_top, margin_bottom = 70, 60
    plot_w = width - margin_left - margin_right

    orgs = sorted({r.org for r in rows})
    row_h = (height - margin_top - margin_bottom) / max(1, len(orgs))
    y_for_org = {org: margin_top + (i + 0.5) * row_h for i, org in enumerate(orgs)}

    min_d = min(r.d for r in rows)
    max_d = max(r.d for r in rows)

    colors = palette()
    org_color = {org: colors[i % len(colors)] for i, org in enumerate(orgs)}

    parts: list[str] = [svg_header(width, height)]
    parts.append(f'<text x="{margin_left}" y="38" class="title">Cross-lab AI timeline (2022–2026)</text>\n')

    # Axis line
    x0 = margin_left
    x1 = margin_left + plot_w
    axis_y = height - margin_bottom + 10
    parts.append(f'<line x1="{x0}" y1="{axis_y}" x2="{x1}" y2="{axis_y}" stroke="#444" stroke-width="1"/>\n')

    # Year ticks
    for t in daterange_year_ticks(min_d, max_d):
        x = to_x(t, min_d, max_d, x0, x1)
        parts.append(f'<line x1="{x}" y1="{axis_y}" x2="{x}" y2="{axis_y + 6}" stroke="#444" stroke-width="1"/>\n')
        parts.append(f'<text x="{x}" y="{axis_y + 22}" text-anchor="middle" class="axis">{t.year}</text>\n')

    # Org rows
    for org in orgs:
        y = y_for_org[org]
        parts.append(f'<text x="{margin_left - 12}" y="{y + 4}" text-anchor="end" class="org">{escape_xml(org)}</text>\n')
        parts.append(f'<line x1="{x0}" y1="{y}" x2="{x1}" y2="{y}" stroke="#eee" stroke-width="1"/>\n')

    # Events (simple label collision avoidance per org: alternate above/below baseline)
    last_x_by_org: dict[str, float] = {}
    flip_by_org: dict[str, bool] = {org: False for org in orgs}

    for r in rows:
        y = y_for_org[r.org]
        x = to_x(r.d, min_d, max_d, x0, x1)
        color = org_color[r.org]

        # Stagger labels if too close
        last_x = last_x_by_org.get(r.org, -1e9)
        too_close = abs(x - last_x) < 120
        if too_close:
            flip_by_org[r.org] = not flip_by_org[r.org]

        label_dy = -18 if not flip_by_org[r.org] else 30
        label_anchor = "middle"

        parts.append(f'<circle cx="{x}" cy="{y}" r="6" fill="{color}" stroke="#111" stroke-width="0.6"/>\n')
        parts.append(
            f'<text x="{x}" y="{y + label_dy}" text-anchor="{label_anchor}" class="label">{escape_xml(r.release)}</text>\n'
        )

        last_x_by_org[r.org] = x

    # Legend (org colors)
    legend_x = margin_left
    legend_y = height - 18
    lx = legend_x
    for org in orgs:
        color = org_color[org]
        parts.append(f'<rect x="{lx}" y="{legend_y - 10}" width="12" height="12" fill="{color}" stroke="#111" stroke-width="0.6"/>\n')
        parts.append(f'<text x="{lx + 18}" y="{legend_y}" class="small">{escape_xml(org)}</text>\n')
        lx += 170

    parts.append(svg_footer())
    return "".join(parts)


def render_capability_curve_svg(rows: list[TimelineRow]) -> str:
    width, height = 1200, 520
    margin_left, margin_right = 70, 30
    margin_top, margin_bottom = 70, 70
    x0 = margin_left
    x1 = width - margin_right
    y0 = height - margin_bottom
    y1 = margin_top

    min_d = min(r.d for r in rows)
    max_d = max(r.d for r in rows)

    seen: set[str] = set()
    points: list[tuple[date, int]] = []
    for r in rows:
        for t in r.tags:
            seen.add(t)
        points.append((r.d, len(seen)))

    max_y = max((c for _, c in points), default=1)

    def to_y(count: int) -> float:
        t = (count - 0) / (max_y or 1)
        # invert
        return lerp(y0, y1, clamp(t, 0.0, 1.0))

    # Build polyline path
    pts = []
    for d, c in points:
        pts.append((to_x(d, min_d, max_d, x0, x1), to_y(c)))
    poly = " ".join(f"{x:.1f},{y:.1f}" for x, y in pts)

    parts: list[str] = [svg_header(width, height)]
    parts.append(f'<text x="{margin_left}" y="38" class="title">Cumulative capability-tags introduced (milestone-based)</text>\n')
    parts.append(
        f'<text x="{margin_left}" y="58" class="small">Counts unique tags seen so far in ai_models_timeline_crosslab.csv (not a benchmark score).</text>\n'
    )

    # Axes
    parts.append(f'<line x1="{x0}" y1="{y0}" x2="{x1}" y2="{y0}" stroke="#444" stroke-width="1"/>\n')
    parts.append(f'<line x1="{x0}" y1="{y0}" x2="{x0}" y2="{y1}" stroke="#444" stroke-width="1"/>\n')

    # Y ticks
    for k in range(0, max_y + 1, max(1, math.ceil(max_y / 6))):
        y = to_y(k)
        parts.append(f'<line x1="{x0 - 5}" y1="{y}" x2="{x0}" y2="{y}" stroke="#444" stroke-width="1"/>\n')
        parts.append(f'<text x="{x0 - 10}" y="{y + 4}" text-anchor="end" class="axis">{k}</text>\n')

    # X year ticks
    for t in daterange_year_ticks(min_d, max_d):
        x = to_x(t, min_d, max_d, x0, x1)
        parts.append(f'<line x1="{x}" y1="{y0}" x2="{x}" y2="{y0 + 6}" stroke="#444" stroke-width="1"/>\n')
        parts.append(f'<text x="{x}" y="{y0 + 22}" text-anchor="middle" class="axis">{t.year}</text>\n')

    # Line + points
    parts.append(f'<polyline points="{poly}" fill="none" stroke="#2563eb" stroke-width="2"/>\n')
    for (x, y), (_, c) in zip(pts, points, strict=True):
        parts.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="3.2" fill="#2563eb"/>\n')

    # End label
    if points:
        end_x, end_y = pts[-1]
        parts.append(f'<text x="{end_x}" y="{end_y - 10}" text-anchor="end" class="small">{points[-1][1]} tags</text>\n')

    parts.append(svg_footer())
    return "".join(parts)


def main() -> int:
    csv_path = Path(__file__).with_name("ai_models_timeline_crosslab.csv")
    rows = read_rows(csv_path)

    out_timeline = Path(__file__).with_name("crosslab_timeline.svg")
    out_curve = Path(__file__).with_name("capability_curve.svg")

    write_svg(out_timeline, render_timeline_svg(rows))
    write_svg(out_curve, render_capability_curve_svg(rows))

    print(f"Wrote {out_timeline}")
    print(f"Wrote {out_curve}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

