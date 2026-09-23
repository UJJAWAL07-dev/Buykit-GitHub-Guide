# BuyKit GitHub Field Guide — Start Here

This is the standalone article for:

`https://buykit.in/blog/github-for-beginners`

## Run it locally (Windows / macOS / Linux)

1. Open this folder in VS Code.
2. Open Terminal → New Terminal.
3. Run:

```bash
npm install
```

4. Then run:

```bash
npm run dev
```

5. Open the localhost URL Vite prints, usually `http://localhost:5173/`.

## Production build

Run:

```bash
npm run build
```

The build script also creates:

`dist/blog/github-for-beginners/index.html`

That nested file helps static hosts serve a direct visit to `/blog/github-for-beginners/` without requiring SPA rewrites.

## What changed in the 1.1 design pass

- Stronger BuyKit branding using the current BuyKit logo published by the BuyKit Insights site.
- More editorial, asymmetric layouts and fewer generic card patterns.
- Improved desktop section rail and mobile navigation.
- Better hero hierarchy and a more deliberate GitHub workflow visual language.
- Expanded beginner explanations for clone, pull, push, init, remote, branches and pull requests.
- Improved terminal simulation with explanations instead of pretending to execute commands.
- Better security guidance and an interactive repository-cleanup exercise.
- More useful command cheat sheet and persistent learning checklist.
- Improved semantic HTML, accessible tabs/buttons, reduced-motion support and responsive behavior.
- Stronger metadata, canonical URL, Article/BreadcrumbList structured data, sitemap and robots file.
- Removed accidental duplicate `robots.txt` and `sitemap.xml` files from `public/images/github/`.
- Added a post-build direct route for `/blog/github-for-beginners/`.

## Brand asset

The page references the official BuyKit logo at:

`https://insights.buykit.in/images/buykit-logo.png`

If you later want the logo bundled locally rather than fetched from the BuyKit site, download that official asset into `public/images/brand/` and change the two logo image paths in `src/main.tsx`.

## Deployment

Upload the contents of `dist/` to the static host used for BuyKit. Make sure the host serves:

`/blog/github-for-beginners/`

and does not block `robots.txt` or the sitemap.

After deployment, verify:

- `https://buykit.in/blog/github-for-beginners`
- page source contains the canonical URL
- the article is mobile friendly
- the OG image URL resolves
- the sitemap includes the article
- Google Search Console can inspect the URL

GOOD LUCK !!
