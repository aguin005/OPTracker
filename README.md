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

## Add it to your iPhone home screen

1. Open **https://aguin005.github.io/OPTracker/** in Safari.
2. Tap the **Share** button, then **Add to Home Screen**.

It opens full screen like an app, and keeps working offline once it has been opened. On a phone, tap episodes to mark
them, swipe to scroll, or press and hold an episode and then drag to mark a run. **Export backup** opens the share
sheet, so you can save the file to Files or AirDrop it.

The home screen app keeps its own saved progress, separate from Safari's. To bring over progress you tracked in a
Safari tab, use **Export backup** there, then **Import backup** in the app. Safari can also clear a site's saved data
after about a week without a visit, which doesn't apply to home screen apps, so the app is the safer home for your
progress.

## Running locally

```bash
cd frontend
npm install
npm run dev
```

`npm run build` outputs a static site to `frontend/dist`. Asset paths are relative, so it works from any folder on
any static host, not only GitHub Pages.

The page is styled like a printed black-and-white manga, with red Conqueror's Haki lightning. Animations follow your
device's reduced-motion setting: with it on, the scenery holds still, and the lightning and celebrations are skipped.
