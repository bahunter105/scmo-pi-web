# SCMO Demo 3B auth and model setup

## Goal

Product-mode sandboxes should start with the approved Codex subscription/provider ready. The end user should not have to log into an LLM provider every time a sandbox runs.

## Decision

Use Docker Sandboxes credential handling and a sandbox-local Pi agent directory.

Do not bake provider credentials into the repo, Docker image, company workspace, or committed config files.

## Preferred Docker Sandboxes path for Codex subscription

Docker Sandboxes supports ahead-of-time OAuth for Codex:

```bash
sbx secret set openai --oauth
```

Docker's host-side proxy keeps the real credential on the host and injects it into matching outbound requests. The sandbox should see only the proxy-managed placeholder, not the actual token.

## Product-mode run defaults

```bash
export SCMO_PRODUCT_MODE=1
export NEXT_PUBLIC_SCMO_PRODUCT_MODE=1
export SCMO_DEFAULT_PROVIDER=openai-codex
export SCMO_DEFAULT_MODEL=gpt-5.4-mini
export PI_CODING_AGENT_DIR=/home/agent/.pi/agent
```

`PI_CODING_AGENT_DIR` keeps Pi/Pi Web runtime state sandbox-local instead of using the host user's `~/.pi`.

## If using API keys later

Use one of these instead of writing secrets to files:

```bash
sbx secret set openai
sbx secret set-custom --host api.openai.com --env OPENAI_API_KEY --value <secret>
```

For plain Pi outside Docker Sandboxes, Pi supports `~/.pi/agent/auth.json`, but that file contains credentials and must not be committed or stored in the mounted company workspace.

## Demo 3B verification

- Start product mode with `SCMO_PRODUCT_MODE=1`.
- Confirm default model/provider resolves to `openai-codex / gpt-5.4-mini`.
- Confirm no provider login prompt appears during a normal first message.
- Confirm `PI_CODING_AGENT_DIR` is sandbox-local.
- Confirm company workspace contains no required `AGENTS.md` identity file.
- Confirm no credentials are written under the company workspace.
