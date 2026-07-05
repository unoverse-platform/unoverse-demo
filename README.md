# Unoverse Demo

A minimal Preact channel client built on the **`@gravity-platform/unoverse-react`** SDK.
It is a thin shell that **loads an app and self-runs** — *"point it at an app id, it
appears and works."* **All UI, layout and styling live in the SDK + server-served
definitions/theme** — this app owns none of it (that's the whole point of the new SDK).

This is the modern successor to the legacy `GravitySAB` widget.

## How it works (the app model — `UNOVERSE_MCP_TEMPLATE_PROTOCOL` §4b)

This client knows only an **app id** + where the server is. The workflow binding is an
**app fact**, not config:

1. Read the app manifest — `resources/read unoverse://apps/<appId>` → `binding.workflow`,
   `binding.trigger`, `autoTrigger`.
2. Open the data-plane (`useUnoverseConnection`) bound to that workflow/trigger.
3. Self-run on connect (manifest `autoTrigger`) — the workflow streams the template
   selection (`WORKFLOW_STATE.metadata.template`) + its components back in.
4. Render the active template via `StreamedUnoverseTemplate`. Actions route to the workflow.

Files:

- `src/App.jsx` — the whole client (load manifest → connect → self-run → render).
- `src/main.jsx` — self-mounting widget (`#unoverse-demo`); the SDK isolates in a Shadow DOM.
- `src/config.js` — `VITE_*` env (`serverUrl`, `apiUrl`, `appId`) + the demo client registry.

## Demo clients (`?client=`)

The shell can skin itself per client: the template the app loads and the fake host-page
screenshot behind the drawer. Clients are registered in `src/config.js` (`clients`) and
routed via a query param — `?client=sab` (default) or `?client=bpp` — so a demo link can
deep-link a client. The small dropdown (top-left) switches live: it swaps the background,
updates the URL, and remounts the app iframe with the new template.

> The client has **zero** workflow knowledge — no binding renders until the app
> manifest provides one. Swap `VITE_APP_ID`, get a different app.

## Develop

```bash
npm install
cp .env.example .env   # then edit
npm run dev            # http://localhost:3008
```

## Build (single embeddable JS)

```bash
npm run build          # → dist/unoverse-demo.js
```

Drop it on any host page:

```html
<script src="/unoverse-demo.js"></script>
```

The widget auto-mounts. To control placement, add `<div id="unoverse-demo"></div>` first.

## Auth

`getAccessToken` in `src/App.jsx` reads `window.__unoverseToken`. Wire your OIDC flow
to set it (or leave unset for anonymous/dev servers).
