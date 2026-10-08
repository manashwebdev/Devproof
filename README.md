# DevProof

One platform that replaces three separate tools:

| Tool | What it does |
| --- | --- |
| Verify claims | Matches every skill on your resume against your public GitHub repositories and gives a trust score (Strong, Moderate, Weak, No Evidence). |
| Compare resumes | Compares two resume versions: skills added or removed, changed lines, and an estimate of which version reads stronger. |
| Project health | Scores a repository on documentation, presentation, structure and activity, with a prioritized to-do list. |
| History | Saves every check to MongoDB so you can track progress (optional). |

## Run it

You need Node.js 18 or newer.

```bash
npm run install:all        # installs root, server and client dependencies
cp server/.env.example server/.env
npm run dev                # API on :5000, app on http://localhost:5173
```

Optional settings in `server/.env`:

- `GITHUB_TOKEN`: raises GitHub's limit from 60 to 5000 requests per hour. Create a token with no scopes at github.com/settings/tokens.
- `MONGODB_URI`: turns on the History page. A free MongoDB Atlas cluster works.

Both are optional. The app runs without them.

## Production

```bash
npm run build              # builds client/dist
npm start                  # the server also serves client/dist
```

## Folder structure

```
devproof/
├── client/                 React + Vite + Framer Motion
│   └── src/
│       ├── api/            fetch wrapper for the API
│       ├── components/     Background, Navbar, ScoreRing, Dropzone, ...
│       ├── hooks/          hash routing, state that survives tab switches
│       ├── pages/          Home, Verifier, ResumeDiff, ProjectHealth, History
│       └── styles/         global.css (design tokens, glow, layout)
└── server/                 Express API
    └── src/
        ├── config/         MongoDB connection (optional)
        ├── middleware/     PDF upload, error handling
        ├── models/         Analysis (history)
        ├── routes/         thin HTTP layer, one file per tool
        ├── services/       all the logic: skills, github, verify, diff, health
        └── utils/          cache, HttpError, asyncHandler
```

## API

| Method | Route | Body |
| --- | --- | --- |
| POST | `/api/verify` | form-data: `username`, and `resume` (PDF) or `resumeText` |
| POST | `/api/diff` | form-data: `before` / `after` (PDF) or `beforeText` / `afterText` |
| POST | `/api/health` | JSON: `{ "repo": "owner/name" }` |
| GET / DELETE | `/api/history`, `/api/history/:id` | |
| GET | `/api/status` | |

## Adding a skill

Add one entry to `SKILLS` in `server/src/services/skills.service.js`. List its `aliases`, and optionally the GitHub `lang` and package `deps` that prove it. Every tool picks it up.
