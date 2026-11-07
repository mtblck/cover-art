# Third-party notices

cover-art is original work under the MIT license (see LICENSE).

- The example covers are Matt's own projects. Their wordmarks are outlined
  into the SVGs from each project's brand font (Google Fonts under the SIL Open
  Font License, which allows this); no font files are in this repo.
- The npm logo in `scripts/logo_pill.py`'s `--npm` pill is npm, Inc.'s
  trademark, used only to say a project is published on npm.
- At run time `render.mjs` uses Playwright and a Chromium only if they are
  already installed, and `logo_pill.py` uses Pillow and fontTools (+ brotli)
  when it needs them. None of them is in this repo, and the scripts never install them.
