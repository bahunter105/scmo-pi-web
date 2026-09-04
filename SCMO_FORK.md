# SCMO Pi Web light fork

## Purpose

This repo is the lightweight SCMO fork of Pi Web.

```text
upstream: https://github.com/agegr/pi-web
origin:   https://github.com/bahunter105/scmo-pi-web
```

Demo 3 goal: make Pi Web feel like an SCMO internal product mode without owning a large fork.

## Product-mode flags

Use both flags while testing because server metadata and client components read environment at different points:

```bash
SCMO_PRODUCT_MODE=1 NEXT_PUBLIC_SCMO_PRODUCT_MODE=1 npm run dev
```

## Current SCMO changes

Keep changes small and upstream-syncable:

- SCMO product-mode constants in `lib/scmo-product-mode.ts`.
- SCMO logo asset at `public/scmo-logo.png`.
- Metadata/title/favicon switches when product mode is enabled.
- Header/new-session branding switches when product mode is enabled.
- Language selector hidden when product mode is enabled.
- Cost display hidden when product mode is enabled.
- Token display remains visible for internal debugging.

## Explicit non-goals for Demo 3

- No full rewrite.
- No public/client-safe mode yet.
- No voice/mic yet.
- No internet hosting.
- No removal of system prompt/history/debug affordances yet.
- No provider credentials in repo.

## Upstream sync

Pull upstream into fork main:

```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

Update the Demo 3 branch after main sync:

```bash
git checkout demo-3-product-mode
git merge main
```

## Fork discipline

- Prefer env-gated changes over deleting upstream behavior.
- Avoid broad formatting changes.
- Keep SCMO changes in named seams.
- Document every intentional divergence here.
