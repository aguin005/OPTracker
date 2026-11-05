# OPTracker
Track your episodes and books.

Everything runs in your browser. Your name, avatar, watched episodes, and owned omnibus volumes are saved to
`localStorage`, so there's no account, server, or database to set up.

That data lives in one browser, so use **Export backup** in the menu to keep a copy or move your progress to another
device, then **Import backup** (or **Restore from a backup** on the welcome screen) to load it there.

## Running locally

```bash
cd frontend
npm install
npm run dev
```

`npm run build` outputs a static site to `frontend/dist` that can be hosted anywhere that serves static files, such as
GitHub Pages, Netlify, or Vercel.
