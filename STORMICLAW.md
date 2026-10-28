# StormiClaw distribution

Version: `2026.10.8+stormi.1`.
Upstream baseline: OpenClaw `v2026.10.8`, commit
`dc2523e5a5c7a309517fd7fa834add938231d526`.

## Ownership and compatibility

This repository is maintained at https://github.com/gengpijia-debug/StormiClaw.
It retains its existing Git history and the upstream MIT license and attribution.
The npm package identity stays `openclaw` because plugins import its public SDK.
The additional `stormiclaw` command uses the same CLI and configuration owner.
The root package is private to prevent accidental npm publication; GitHub source
visibility is managed separately.

## Local behavior

- Retain keyword-only memory search when `memory.search.provider` is `none`,
  including the explicit transition from an embedding-backed index.
- Report disabled embeddings clearly in keyword-only memory status.
- Use upstream provider authentication. The old placeholder-key fallback is
  retired; a missing credential produces the provider's actual setup error.
- Preserve existing user configuration, credentials, conversations, and workspaces
  in their standard OpenClaw locations. Never commit them to this repository.

## Build from source

Use Node `26.12.1` or a newer supported runtime and the pnpm version pinned in
`package.json`. Install and build from this checkout:

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm ui:build
```

An existing Gateway must not serve this checkout's artifacts during a rebuild.
Prepare changes in an independent checkout, then use the source installation's
native updater for activation. Do not run the upstream npm installer over this
source installation.

## Upgrade and verification

`stormiclaw update` tracks this repository's `origin/main`; it does not import
new upstream OpenClaw changes automatically. Maintainer upgrades first import a
fixed upstream release into an independent checkout, reconcile local behavior,
run focused memory/provider/recovery checks, and build the runtime and UI.
After review, publish the owned source revision and activate through the native
updater, preserving verified state backups until runtime acceptance.

Verify with `stormiclaw --version`, `stormiclaw gateway status --deep`,
`stormiclaw health`, and `stormiclaw memory status --agent main`. Confirm the
configured channel connects and a real OpenAI turn completes. Provider-backed
checks can incur the account's normal inference usage.
