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
    → renderToolbar(x, y, highlightId, canHighlight) → Toolbar.tsx shows floating toolbar
      → user clicks "Highlight" (or picks a color/style in Palette, adds a note, etc.)
        → inject.ts: higlightSelectedText(color, style) wraps the selection in
          <span data-highlight-id> styled by buildHighlightCss() (background fill or
          colored text-decoration)
        → chrome.runtime.sendMessage({ type: "ACTION_CLICKED", payload: { id, text, url, context, color, style, note? } })
          → background/serviceWorker.ts appends to chrome.storage.local["highlights"]
            → popup/Popup.tsx reads chrome.storage.local["highlights"] on open
            → on later page loads, inject.ts loadPageHighlights() re-wraps them via stored context
```

Background message types (`src/background/serviceWorker.ts`): `ACTION_CLICKED` (create), `UPDATE_HIGHLIGHT` (recolor/restyle), `UPDATE_NOTE` (note text), `DELETE_HIGHLIGHT`.

### Content script isolation (`src/content/`)

The content script mounts React into a **closed Shadow DOM** to prevent style leakage from host pages. Highlights themselves live in the host page DOM (outside the shadow root) as inline-styled `<span data-highlight-id>` wrappers. Key files:

- **`inject.ts`** — All DOM/selection logic (no React). Module-level globals `lastRange` (frozen clone of the selection) and `hideTimer`. Exports include `setupHighlighter`, `higlightSelectedText`, `highlightWithNote`, `restyleHighlight`, `markHighlightHasNote`, `removeHighlight`, `loadPageHighlights`, `setupNoteHover`, `clearSelectionState`. `buildHighlightCss(color, style)` is the single source of truth for how a highlight renders.
- **`main.tsx`** — Creates `<div id="my-extension-root">`, attaches the closed Shadow DOM, mounts `HighlighterRoot`, wires `setupHighlighter`/`setupNoteHover` callbacks, owns toolbar/viewer state and the per-highlight `notes` map, and sends all `chrome.runtime` messages.
- **`Toolbar.tsx`** — Floating toolbar: Highlight / Change Color / Add Note / Delete. Nested highlights are prevented — when a selection overlaps an existing highlight the Highlight button is hidden and the palette/note act on that whole highlight instead.
- **`Palette.tsx`** + **`paletteOptions.ts`** — Color + style picker (8 colors; styles `default | underline | wave | strike`). Constants live in the `.ts` file so the `.tsx` only exports a component (fast-refresh lint rule).
- **`Note.tsx`** / **`NoteViewer.tsx`** — Note editor (in the toolbar) and the hover popover shown over a highlight that has a note.

### Shared types

`src/shared/types.ts` defines `HighlightStyle` and the `Highlight` interface `{ id, text, timestamp, url, context, color, style?, note? }`, used across background, content, and popup. `src/shared/utils.ts` implements `normalizeUrl()` (used to scope highlights to a page). `src/shared/storage.ts` is still an empty stub.

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
