# houm.github.io

Static site for Houm, published with GitHub Pages: an overview of the app and its
[Privacy Policy](privacy-policy.html).

## Structure

- `index.html` — landing page: screenshots, features, platforms, and every supported service.
- `privacy-policy.html` — privacy policy, served at the clean URL `/privacy-policy` (GitHub Pages resolves extensionless paths to their `.html` file).
- `assets/styles.css` — shared stylesheet for both pages, in the app's own palette (light and dark).
- `assets/fonts/` — Manrope and Space Grotesk, the app's typefaces (SIL Open Font License).
- `assets/screenshots/` — the app screens shown on the landing page.
- `tools/screenshots/` — the source those screens are rendered from (see below).
- `.github/workflows/deploy.yml` — GitHub Actions workflow that builds and deploys the site to GitHub Pages on every push to `main`.
- `.nojekyll` — disables Jekyll processing so the plain HTML/CSS is served as-is.

## Local preview

No build step is required. Serve the files with any static file server, for example:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Screenshots

The images in `assets/screenshots/` are rendered from `tools/screenshots/screens.html`,
which redraws the app's screens from its own design tokens with made-up hosts,
containers, figures and log lines. They show the server-management side of the app —
the rack, the array, the containers, the logs and the house — and deliberately none of
the media side. To change one, edit that page and re-render (needs Chromium; set
`CHROMIUM_PATH` if it isn't at the Playwright default):

```sh
cd tools/screenshots
npm install
npm run render
```

To use real captures instead, overwrite the file of the same name — phones at 390×844
points (any 2× or 3× PNG of that shape).

## Deployment

The site deploys automatically via the `Deploy static site to GitHub Pages` workflow on
every push to `main`. One-time setup: in the repository **Settings → Pages**, set
**Build and deployment → Source** to **GitHub Actions**. After that, pushes to `main`
publish to `https://houm-so.github.io/houm.github.io/` (or the repo's configured custom
domain, if any).
