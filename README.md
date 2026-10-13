# trimcraft.github.io

The website of [Trimcraft](https://github.com/trimcraft/trimcraft), the HOTAS and cockpit
toolkit for flight and space sims: **https://trimcraft.github.io**

Plain static HTML, CSS and a few lines of JavaScript. No framework, no build step for the page
itself, no trackers, no cookies, no external fonts or CDNs. The only external request is the
GitHub API call that shows the latest release version.

## Layout

| Path | What |
|---|---|
| `site/` | Everything that is published: `index.html`, `404.html`, CSS, JS, images, favicons, `robots.txt`, `sitemap.xml` |
| `site/assets/js/main.js` | Latest-version lookup and `CONFIG` (repository, optional support link) |
| `src-images/` | Source screenshots and the app icon, copied from the app repository's `docs/images/` and `assets/icon.svg` |
| `tools/build-assets.mjs` | Turns `src-images/` into the WebP screenshots, close-ups, favicons and the 1200×630 social image in `site/` |
| `.github/workflows/pages.yml` | Deploys `site/` to GitHub Pages on every push to `main` |

## Working on it

Preview locally:

```sh
npx serve site
```

After changing a screenshot or the icon in `src-images/`, regenerate the images and commit the
output:

```sh
npm --prefix tools ci
node tools/build-assets.mjs
```

When the page content changes noticeably, update `<lastmod>` in `site/sitemap.xml`.

**Support link:** set `CONFIG.supportUrl` in `site/assets/js/main.js` to show "Support" in the
footer.

## Licence

The code of this site is free software under the
[GNU General Public License v3.0 or later](LICENSE). The screenshots, the Trimcraft name and logo
belong to the Trimcraft project.
