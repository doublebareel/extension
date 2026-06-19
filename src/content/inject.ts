import type { Highlight } from "../shared/types";
import {
  normalizeUrl,
  detectBackgroundTheme,
  type Theme,
} from "../shared/utils";

interface RenderToolbarCallback {
  (x: number, y: number, theme: Theme, highlightId: string | null): void;
}
interface HideToolbarCallback {
  (): void;
}

let hideTimer: ReturnType<typeof setTimeout> | null = null;
let globalSelection: Selection | null = null;

const clearHideTimer = () => {
  if (hideTimer !== null) {
    window.clearTimeout(hideTimer);
    hideTimer = null;
  }
};

const scheduleHide = (hideToolbar: HideToolbarCallback) => {
  clearHideTimer();
  hideTimer = window.setTimeout(() => {
    hideTimer = null;
    hideToolbar();
  }, 120);
};

const getSelectionToolbarPosition = (): {
  x: number;
  y: number;
  theme: Theme;
  highlightId: string | null;
} | null => {
  const selection = window.getSelection();

  if (
    !selection ||
    selection.isCollapsed ||
    selection.rangeCount === 0 ||
    selection.toString().trim() === ""
  ) {
    return null;
  }

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  if (rect.width === 0 && rect.height === 0) {
    return null;
  }

  // Sample the element that actually holds the selected text so we read the
  // background behind the selection (e.g. a dark code block on a light page).
  const anchor = range.commonAncestorContainer;
  const element =
    anchor.nodeType === Node.TEXT_NODE
      ? anchor.parentElement
      : (anchor as Element);
  const theme = detectBackgroundTheme(element);

  // Only worth offering "Delete" when the selection sits inside an existing
  // highlight, so the toolbar can hide the button otherwise.
  const highlightId =
    element
      ?.closest("span[data-highlight-id]")
      ?.getAttribute("data-highlight-id") ?? null;

  return { x: rect.left + rect.width / 2, y: rect.top, theme, highlightId };
};

const handleSelectionChange = (
  renderToolbar: RenderToolbarCallback,
  hideToolbar: HideToolbarCallback,
) => {
  const position = getSelectionToolbarPosition();

  if (!position) {
    scheduleHide(hideToolbar);
    return;
  }

  clearHideTimer();
  renderToolbar(position.x, position.y, position.theme, position.highlightId);
};

const handleReposition = (renderToolbar: RenderToolbarCallback) => {
  const position = getSelectionToolbarPosition();

  if (!position) {
    return;
  }

  renderToolbar(position.x, position.y, position.theme, position.highlightId);
};

export const setupHighlighter = (
  renderToolbar: RenderToolbarCallback,
  hideToolbar: HideToolbarCallback,
) => {
  document.addEventListener("mouseup", () => {
    handleSelectionChange(renderToolbar, hideToolbar);
    const selection = document.getSelection();
    if (
      selection &&
      selection.rangeCount !== 0 &&
      selection.toString() !== ""
    ) {
      globalSelection = selection;
    }
  });

  document.addEventListener(
    "scroll",
    () => {
      handleReposition(renderToolbar);
    },
    { capture: true, passive: true },
  );
};

const getTextNodesInRange = (
  range: Range,
): Array<{ node: Text; startOffset: number; endOffset: number }> => {
  const ancestor =
    range.commonAncestorContainer.nodeType === Node.TEXT_NODE
      ? range.commonAncestorContainer.parentElement!
      : (range.commonAncestorContainer as Element);

  const walker = document.createTreeWalker(ancestor, NodeFilter.SHOW_TEXT);
  const result: Array<{ node: Text; startOffset: number; endOffset: number }> =
    [];

  let node: Text;
  while ((node = walker.nextNode() as Text)) {
    if (!range.intersectsNode(node)) continue;

    const startOffset = node === range.startContainer ? range.startOffset : 0;
    const endOffset =
      node === range.endContainer ? range.endOffset : node.length;

    if (startOffset === endOffset) continue;

    result.push({ node, startOffset, endOffset });
  }

  return result;
};

const extractContext = (range: Range): string => {
  const preRange = document.createRange();
  preRange.setStart(document.body, 0);
  preRange.setEnd(range.startContainer, range.startOffset);
  const before = preRange.toString().slice(-100);

  const postRange = document.createRange();
  postRange.setStart(range.endContainer, range.endOffset);
  postRange.setEnd(document.body, document.body.childNodes.length);
  const after = postRange.toString().slice(0, 100);

  return `${before}[[[${range.toString()}]]]${after}`;
};

const wrapTextNodes = (
  nodes: Array<{ node: Text; startOffset: number; endOffset: number }>,
  id: string,
  color: string,
) => {
  for (const { node, startOffset, endOffset } of nodes) {
    // Trim the tail first so startOffset is still valid for the original node
    if (endOffset < node.length) {
      node.splitText(endOffset);
    }

    const targetNode: Text =
      startOffset > 0 ? node.splitText(startOffset) : node;

    const span = document.createElement("span");
    span.dataset.highlightId = id;
    span.style.cssText = `background-color:${color};display:inline;`;

    targetNode.parentNode!.insertBefore(span, targetNode);
    span.appendChild(targetNode);
  }
};

export const higlightSelectedText = (): {
  id: string;
  text: string;
  context: string;
} | null => {
  const selection = globalSelection;
  if (!selection || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  const text = range.toString().trim();
  if (!text) return null;

  const id = crypto.randomUUID();
  const context = extractContext(range);
  const nodes = getTextNodesInRange(range);

  wrapTextNodes(nodes, id, "yellow");

  selection.removeAllRanges();
  globalSelection = null;

  return { id, text, context };
};

export const removeHighlight = (id: string) => {
  document
    .querySelectorAll(`span[data-highlight-id="${id}"]`)
    .forEach((span) => {
      while (span.firstChild) {
        span.parentNode!.insertBefore(span.firstChild, span);
      }
      span.parentNode!.removeChild(span);
    });
};

const reapplyHighlight = (highlight: Highlight) => {
  const { id, context, color } = highlight;

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  const positions: number[] = [];
  let fullText = "";

  let node: Text;
  while ((node = walker.nextNode() as Text)) {
    if ((node.parentElement as HTMLElement)?.dataset?.highlightId) continue;
    positions.push(fullText.length);
    fullText += node.textContent ?? "";
    textNodes.push(node);
  }

  const openMarker = "[[[";
  const closeMarker = "]]]";
  const openIdx = context.indexOf(openMarker);
  const closeIdx = context.indexOf(closeMarker);

  let highlightStart = -1;

  if (openIdx !== -1 && closeIdx !== -1) {
    const before = context.slice(0, openIdx);
    const selectedText = context.slice(openIdx + openMarker.length, closeIdx);
    const after = context.slice(closeIdx + closeMarker.length);

    // Try full context match first
    const fullContextStr = before + selectedText + after;
    const matchIdx = fullText.indexOf(fullContextStr);
    if (matchIdx !== -1) {
      highlightStart = matchIdx + before.length;
    } else {
      // Fallback: match just the selected text with as much context as possible
      const withBefore = before.slice(-20) + selectedText;
      const fallbackIdx = fullText.indexOf(withBefore);
      if (fallbackIdx !== -1) {
        highlightStart = fallbackIdx + before.slice(-20).length;
      } else {
        highlightStart = fullText.indexOf(selectedText);
      }
    }
  }

  if (highlightStart === -1) {
    return;
  }

  const selectedText = context.slice(
    context.indexOf(openMarker) + openMarker.length,
    context.indexOf(closeMarker),
  );
  const highlightEnd = highlightStart + selectedText.length;

  // Find which text nodes cover [highlightStart, highlightEnd]
  const affectedNodes: Array<{
    node: Text;
    startOffset: number;
    endOffset: number;
  }> = [];

  for (let i = 0; i < textNodes.length; i++) {
    const nodeStart = positions[i];
    const nodeEnd = nodeStart + (textNodes[i].textContent?.length ?? 0);

    if (nodeEnd <= highlightStart || nodeStart >= highlightEnd) continue;

    affectedNodes.push({
      node: textNodes[i],
      startOffset: Math.max(0, highlightStart - nodeStart),
      endOffset: Math.min(textNodes[i].length, highlightEnd - nodeStart),
    });
  }

  wrapTextNodes(affectedNodes, id, color);
};

export const loadPageHighlights = () => {
  chrome.storage.local.get("highlights", (result) => {
    const highlights: Highlight[] = (result.highlights as Highlight[]) ?? [];
    const currentUrl = normalizeUrl(location.href);
    highlights.filter((h) => h.url === currentUrl).forEach(reapplyHighlight);
  });
};

export const getSelectedHighlightId = (): string | null => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  const node = selection.anchorNode;
  if (!node) return null;

  const el =
    node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as Element);
  const span = el?.closest("span[data-highlight-id]");
  return span?.getAttribute("data-highlight-id") ?? null;
};
