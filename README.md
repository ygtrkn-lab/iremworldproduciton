# IREMWORLD (irem)

This repository contains the IREMWORLD Next.js web application for real estate listings and services.

## Quick start (local)

1. Install dependencies

```powershell
npm ci
```

2. Run development server

```powershell
npm run dev
```

3. Build for production

```powershell
npm run build
```

## Prepare for GitHub (create new repo)

If you want me to create a GitHub repo named `iremworldproject`, you can run the following (replace `<GITHUB_USER>` with your GitHub username):

```powershell
# Optional: install and authenticate GitHub CLI
gh auth login

# Create repo and push current folder
gh repo create <GITHUB_USER>/iremworldproject --public --source=. --remote=origin --push

# Or, using git directly
git remote add origin https://github.com/<GITHUB_USER>/iremworldproject.git
git branch -M main
git push -u origin main
```

> NOTE: `gh repo create` will create the repo under your account and optionally push the code automatically.

## GitHub Actions (CI)

This repo includes a minimal GitHub Actions workflow at `.github/workflows/ci.yml` to run a build check on push. If you want, you can enable additional test steps.

## Deploy to Vercel

Vercel is the recommended way to deploy this Next.js site. Two approaches:

1. Vercel Dashboard: Connect your GitHub account, choose the `iremworldproject` repository, and enable auto-deploy on push. Configure environment variables in Vercel dashboard if needed.

2. Vercel CLI (PowerShell):

```powershell
# Install vercel CLI globally (or use npx)
npm i -g vercel
vercel login

# Run vercel to link or create a new project, then deploy
vercel --prod
```

For production builds, Vercel detects this is a Next.js app and runs `npm run build` automatically.

## Environment variables

If your app requires secrets (e.g., database, cloudinary keys), add them in the Vercel dashboard for the project. Use `VERCEL_PROJECT_ID` and `VERCEL_ORG_ID` when configuring GitHub Actions for deployment (optional).

### Google Sign-in

The `/api/auth/google` flow expects these keys (store them in `.env.local` locally and in your hosting provider’s environment settings):

```bash
GOOGLE_CLIENT_ID=594638373214-4ngd1vh6426025gh9ihihp11ocfqjhg4.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<your_google_client_secret>
# Optional – override only if you use a custom domain/callback URL
GOOGLE_REDIRECT_URI=https://your-domain.com/api/auth/google/callback
```

- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`: created in Google Cloud Console → OAuth consent screen / Credentials.
- `GOOGLE_REDIRECT_URI`: defaults to `https://<host>/api/auth/google/callback`; set this value exactly in the Google console’s “Authorized redirect URIs” list.
- After deploying, ensure the production origin matches the redirect URI or update the env accordingly.

## Post-deploy checks

- Open the Vercel project dashboard -> Domains -> Add a domain if you have one
- Verify that pages such as `https://<project>.vercel.app/property`, `/store` route and `/api/stores` work.

## Contact

If you want me to finish and push to GitHub and connect Vercel for you, share your GitHub username and whether the repository should be public or private. I can then provide exact commands to run on your machine.

## Troubleshooting & Notes

- If you see a DevTools warning like:
	"Loading the script 'https://translate.google.com/..' violates the Content Security Policy: 'script-src' ..."
	then either:
	- Enable the translation widget by setting env vars: `ENABLE_GOOGLE_TRANSLATE=true` (server) and `NEXT_PUBLIC_ENABLE_GOOGLE_TRANSLATE=true` (client) before building, or
	- Remove/disable the language selector component (by not including it in your layout/pages).

- If the AI insight endpoint returns 500: ensure `OPENAI_API_KEY` is set. The API now returns 503 when missing and logs a useful error with more context.

- If you get the browser message:
	`Refused to execute script from '/_next/static/css/xxxxx.css' because its MIME type ('text/css') is not executable` — this means a link to a CSS file is being attempted to be executed as a script. This usually occurs when some script uses a CSS URL in a `script` tag. Reproduce locally with DevTools Network & Call Stack to find the request source. Common causes include:
	- Third-party widgets injecting remote resources (translate, GA, marzipano, etc.)
	- Service worker or custom loader incorrectly mapping CSS as JS
	- Programmatic creation of `<script>` elements where a `<link rel="stylesheet">` should be used

	To debug: reproduce locally, open DevTools, filter the network to the CSS filename, open the initiator or call stack, and inspect which JS inserted the `<script>` tag.
