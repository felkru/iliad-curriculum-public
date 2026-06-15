# Contributing

This is the **public** Iliad Intensive curriculum site — a small Next.js app
that Vercel builds and serves. It is the *output* of the curriculum CMS, not
where most content is authored.

There are two repos:

| Repo | What it is | Where it runs |
|------|------------|---------------|
| `iliad-curriculum-admin` | The CMS / WYSIWYG editor, conversion worker, exporter | a Hetzner box (`iliad-admin.felkru.com`) |
| `iliad-curriculum-public` (**this repo**) | The static reader site + content it publishes | Vercel (auto-builds on push to `main`) |

## ⚠️ The one rule: don't hand-edit module content

`content/modules/<slug>.mdx` is **generated**. The admin database is the source
of truth: every time someone publishes a module from the admin, the exporter
overwrites `content/modules/<slug>.mdx` (and `public/uploads/<slug>/`) and
pushes a `publish: <slug>` commit. **Any manual edit you make to a module file
will be silently overwritten on the next publish of that page.**

So:

- **To change a module's content** (text, math, exercises, figures): edit it in
  the admin at `iliad-admin.felkru.com` and click Save / Publish. Don't touch
  the `.mdx` here.
- This is also why a hand-pushed change can "fail checks" or get clobbered —
  it's racing the admin's publish pushes.

## What you *can* edit here by hand

- **Site chrome & components** — everything under `src/` (layout, styling,
  navigation, the MDX component renderers in `src/lib/mdx.tsx`). Keep the
  component renderers in lockstep with the admin's `src/lib/mdx/render.tsx`,
  which mirrors them for editor previews.
- **Non-module content** — `content/about.mdx`, `content/site-config.json`,
  `content/clusters.json`. (Note: making `about.mdx` editable from the admin is
  a planned change; until then it's hand-edited here.)
- `content/index.json` / `content/redirects.json` are also exporter-managed —
  prefer changing ordering/redirects through the admin.

## Local development

```bash
git clone git@github.com:felkru/iliad-curriculum-public.git
cd iliad-curriculum-public
npm install
npm run dev          # http://localhost:3000 — full local render of the site
```

No database or secrets are needed for local rendering — the content lives in
`content/` as committed files.

## Branches & deploys

- `main` is production. Every push to `main` triggers a Vercel build/deploy.
- Any **other** branch you push gets a Vercel **preview** deployment (a unique
  URL) — use these for site/chrome changes you want to review before merging.
- The admin uses throwaway `preview/<slug>` branches for per-draft previews.
  **Don't push to `preview/*`** (they are force-pushed and disposable) and
  **don't commit module content to `main`** by hand (see the rule above).

## Making a change to the site itself

1. Branch off `main`, make your `src/` change, `npm run dev` to check it.
2. Push the branch → open the Vercel preview URL to verify.
3. Open a PR into `main`. Once merged, Vercel deploys it to production.
