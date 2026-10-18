# Harish S portfolio

```bash
npm install
npm run dev      # local dev server
npm run build    # static output in dist/
npm run preview  # preview the production build
```

All content lives in `src/data/`. The résumé PDF is served from `public/`.

The intro loader plays on the first visit only (flag in `localStorage`). Open the site with `?intro` to replay it. Reduced-motion users never see it.


## Adding project links and screenshots

Everything is in `src/data/projects.js`. Paste a real URL into `githubUrl`, `liveUrl` or `caseStudy` and the
matching button appears on that project; leave it empty and nothing is shown. Put screenshots in
`public/projects/` and set `image` to `'projects/<file>.png'`.

```
npm run check:links              # which links are missing, which are malformed
npm run check:links -- --online  # also confirms each GitHub repo / live URL responds
```

During `npm run dev`, projects without a `githubUrl` show a small dashed reminder. It is not in production builds.
