# Changelog

## 1.3.0 (2026-11-07)

- Moved from mtblck/claude-marketplace to its own repo, with its git history,
  which is also a one-plugin marketplace
  (`/plugin install cover-art --marketplace mtblck/cover-art`). No change to
  the skill itself.

## 1.2.0 (2026-11-06)

- Covers fill the frame (no wide plain border) and carry the project's logo in
  a dark pill bottom left, and projects on npm an npm pill bottom right.
- `scripts/logo_pill.py` draws both pills, with the wordmark set in the brand
  font as paths.
- A safe area for the focal point and pill that also fits the Ko-fi crop;
  guidance for a project missing from the portfolio, for a separate site repo,
  and for pixel-art shade ramps.

## 1.1.0 (2026-11-06)

- `render.mjs` also writes a 1600 × 900 (16:9) Ko-fi PNG, cropped from the
  middle of each cover.

## 1.0.1 (2026-10-23)

- `render.mjs` renders the first SVG when `--out` is absent.

## 1.0.0 (2026-10-23)

- `cover-art` skill: minimalist, representational 16:10 cover illustrations
  from a project's repo, purpose and colours, with five concept patterns and
  seven example covers.
