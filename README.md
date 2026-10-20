# houm.github.io

Static site for Houm, published with GitHub Pages: an overview of the app and its
[Privacy Policy](privacy-policy.html).

## Structure

- `index.html` — landing page: screenshots, features, platforms, and every supported service.
- `privacy-policy.html` — privacy policy, served at the clean URL `/privacy-policy` (GitHub Pages resolves extensionless paths to their `.html` file).
- `assets/styles.css` — shared stylesheet for both pages, in the app's own palette (light and dark).
- `assets/fonts/` — Manrope and Space Grotesk, the app's typefaces (SIL Open Font License).
- `assets/screenshots/` — the app screens shown on the landing page.
- `store/` — the same screens at the sizes the App Store and Play Store take (see below).
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

### Store listings

The same render writes the store screenshots into `store/`, one folder per size the
stores take, all opaque PNGs (neither store accepts an alpha channel):

| Folder | Size | For |
|---|---|---|
| `store/ios-medium/` | 1179×2556 | App Store Connect, iPhone with Dynamic Island (medium display) — the one iPhone size it requires |
| `store/ios-large/` | 1320×2868 | App Store Connect, iPhone with Dynamic Island (large display) — optional |
| `store/android/` | 1170×2340 | Play Console phone screenshots: portrait, at least 1080 px, long side no more than twice the short side |

The Android set draws the system's own status bar and gesture bar in place of the
iPhone's. Sizes come from App Store Connect's [screenshot specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/)
and Play Console's [preview assets](https://support.google.com/googleplay/android-developer/answer/9866151) page; the targets are listed at the top of `tools/screenshots/render.mjs`.
iPad, Apple TV and Android TV listings are not covered: the iPad lays the app out
differently, and the TV app is a media player with no server-management screen to show.

## Deployment

The site deploys automatically via the `Deploy static site to GitHub Pages` workflow on
every push to `main`. One-time setup: in the repository **Settings → Pages**, set
**Build and deployment → Source** to **GitHub Actions**. After that, pushes to `main`
publish to `https://houm-so.github.io/houm.github.io/` (or the repo's configured custom
domain, if any).
