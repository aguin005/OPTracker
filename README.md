# OPTracker
Track your episodes and books.

Everything runs in your browser. Your name, watched episodes, and owned omnibus volumes are saved to `localStorage`,
so there's no account, server, or database to set up.

That data lives in one browser, so use **Export backup** in the menu to keep a copy or move your progress to another
device, then **Import backup** (or **Restore from a backup** on the welcome screen) to load it there.

## Live site

The app deploys to GitHub Pages at **https://aguin005.github.io/OPTracker/** every time `main` changes, using the
workflow in `.github/workflows/deploy-pages.yml`.

One-time setup: in the repository's **Settings > Pages**, under **Build and deployment**, set **Source** to
**GitHub Actions**. You can also redeploy by hand from the **Actions** tab with **Run workflow**.

## Running locally

```bash
cd frontend
npm install
npm run dev
```

`npm run build` outputs a static site to `frontend/dist`. Asset paths are relative, so it works from any folder on
any static host, not only GitHub Pages.

Animations follow your device's reduced-motion setting: with it on, the scenery holds still and the celebrations
are skipped.
