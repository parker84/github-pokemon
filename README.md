# github-pokemon

Turn any GitHub profile into a retro, cyberpunk trading card (GitHub-dark black + neon greens).
Enter a GitHub URL → fetch their public stats → render a Pokémon-style card you can download as a PNG.

Inspired by [intheweights.com](https://intheweights.com).

## How it works

```
one Next.js app
├─ frontend   app/page.tsx, components/   ← input + card preview + PNG download (browser)
└─ "backend"  app/api/card/route.ts       ← thin wrapper over /lib (Vercel function)
   └─ lib/    github.ts · score.ts · oracle.ts · card.ts  ← all logic, framework-agnostic
```

The frontend only ever calls `/api/card`. Tokens stay server-side. If this ever needs a
standalone backend, lift `/lib` out verbatim and wrap it in Express/Hono — no rewrite.

- **Bars** = top languages by code bytes, colored with GitHub Linguist's official palette.
- **Power / TOP X%** = transparent log-scaled heuristic over stars, followers, repos, contributions (see `lib/score.ts`).
- **THE ORACLE SAYS** = Claude-generated flavor text (`claude-haiku-4-5`), falls back to the GitHub bio.
- **Type / level / class** derived from the dominant language + rank.

## Run locally

```bash
npm install
cp .env.example .env.local   # fill in tokens (both optional for a first run)
npm run dev                  # http://localhost:3000
```

Then enter e.g. `github.com/torvalds` or `@torvalds`.

## Environment

| var | required | effect |
|-----|----------|--------|
| `GITHUB_TOKEN` | optional | REST works unauthenticated at 60 req/hr. A token raises it to 5000/hr **and** is required for the contribution count (GraphQL). |
| `ANTHROPIC_API_KEY` | optional | Enables the Claude-written flavor text. Without it, the card uses the GitHub bio. |
| `NEXT_PUBLIC_SITE_NAME` | optional | Footer text on the card. |

## Deploy

Push to GitHub and import into Vercel. Set the env vars in the Vercel dashboard. Done.

## Status / next ideas

- ✅ Profile fetch, language aggregation, scoring, card UI, PNG export, caching, error handling.
- ⬜ Dynamic OG image at `/card/[username]` so shared links unfurl as the card.
- ⬜ Persistent cache (Vercel KV) instead of per-request.
- ⬜ "Moves" row (top repos) + a type badge graphic.
