# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Watch mode for both builds in parallel (use during development)
npm run build     # Production build (runs both Vite configs sequentially)
npm run lint      # ESLint check
```

After any build, load/reload the unpacked extension from `dist/` in Chrome (`chrome://extensions` → Load unpacked).

There are no tests configured.

## Architecture

This is a **Manifest V3 Chrome Extension** with four isolated execution contexts. Two separate Vite configs are required because the content script must be bundled as IIFE while the rest uses ES modules.

### Build outputs (`dist/`)

| File | Vite config | Format | Source |
|------|-------------|--------|--------|
| `popup.js` / `options.js` / `background.js` | `vite.config.ts` | ES module | `popup.html`, `options.html`, `src/background/serviceWorker.ts` |
| `content.js` | `vite.content.config.ts` | IIFE | `src/content/main.tsx` |

The content config sets `emptyOutDir: false` to avoid wiping the main build output.

### Execution contexts and communication

```
User selects text on page
  → content/inject.ts (mouseup listener)
    → renderToolbar(x, y) → ContentApp.tsx shows floating toolbar
      → user clicks "Highlight"
        → inject.ts: higlightSelectedText() wraps selection in <span style="backgroundColor:yellow">
        → chrome.runtime.sendMessage({ type: "ACTION_CLICKED", payload: text })
          → background/serviceWorker.ts appends to chrome.storage.local["highlights"]
            → popup/Popup.tsx reads chrome.storage.local["highlights"] on open
```

### Content script isolation (`src/content/`)

The content script mounts React into a **closed Shadow DOM** to prevent style leakage from host pages. Three files cooperate:

- **`inject.ts`** — DOM/selection logic. Exports `setupHighlighter(renderToolbar, hideToolbar)`, `getSelectedText()`, `higlightSelectedText()`. Uses module-level globals (`selectedTextValue`, `globalSelection`, `hideTimer`).
- **`main.tsx`** — Creates `<div id="my-extension-root">`, attaches closed Shadow DOM, mounts `HighlighterRoot`, and wires `setupHighlighter` callbacks.
- **`ContentApp.tsx`** — Stateless React component receiving `{ x, y, visible, onAction }` props; renders the floating toolbar.

### Shared types

`src/shared/types.ts` defines the `Highlight` interface `{ id, text, timestamp }` used by both background and popup. `src/shared/storage.ts` and `src/shared/utils.ts` are stubs with no implemented logic yet.

### Styling

Each context has its own `styles.scss`. Shadow DOM isolation means content script styles are self-contained; popup and options styles are scoped to their own HTML pages.

## Code Style

**Braces and if statements** — always open the brace on a new line, never inline. This applies even to single-expression returns:

```ts
// correct
if (condition)
{
  return value;
}

// wrong
if (condition) { return value; }
if (condition) return value;
```

**Iterators and callbacks** — always use descriptive parameter names, never single letters:

```ts
// correct
highlights.map(highlight => highlight.text)
items.forEach(item => item.prop)

// wrong
highlights.map(h => h.text)
items.forEach(x => x.prop)
```
