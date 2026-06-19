import type { Highlight } from "../shared/types";

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "ACTION_CLICKED") {
    const { id, text, url, context, color } = message.payload;

    const newHighlight: Highlight = {
      id,
      text,
      timestamp: Date.now(),
      url,
      context,
      color,
    };

    chrome.storage.local.get("highlights", (result) => {
      const current = (result.highlights as Highlight[]) ?? [];
      chrome.storage.local.set({ highlights: [...current, newHighlight] });
    });
  }

  if (message.type === "DELETE_HIGHLIGHT") {
    const { id } = message.payload;

    chrome.storage.local.get("highlights", (result) => {
      const current = (result.highlights as Highlight[]) ?? [];
      chrome.storage.local.set({
        highlights: current.filter((highlight) => highlight.id !== id),
      });
    });
  }
});
