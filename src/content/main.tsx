import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import Toolbar from "./Toolbar";
import {
  higlightSelectedText,
  setupHighlighter,
  removeHighlight,
  loadPageHighlights,
} from "./inject";
import styles from "./styles.scss?inline";
import { normalizeUrl, type Theme } from "../shared/utils";

const host = document.createElement("div");
host.id = "my-extension-root";
document.body.appendChild(host);

const shadowRoot = host.attachShadow({ mode: "closed" });

const styleEl = document.createElement("style");
styleEl.textContent = styles;
shadowRoot.appendChild(styleEl);

const mountPoint = document.createElement("div");
shadowRoot.appendChild(mountPoint);

const HighlighterRoot = () => {
  const [toolbarState, setToolbarState] = useState({
    visible: false,
    x: 0,
    y: 0,
    theme: "light" as Theme,
    highlightId: null as string | null,
  });

  useEffect(() => {
    const renderToolbar = (x: number, y: number, theme: Theme, highlightId: string | null) => {
      setToolbarState({ visible: true, x, y, theme, highlightId });
    };

    // const hideToolbar = () => {
    //   setToolbarState((current) =>
    //     current.visible ? { ...current, visible: false } : current,
    //   );
    // };

    setupHighlighter(renderToolbar, hideToolbar);
    loadPageHighlights();
  }, []);

    const hideToolbar = () => {
      setToolbarState((current) =>
        current.visible ? { ...current, visible: false } : current,
      );
    };

  const onHighlight = () => {
    const result = higlightSelectedText();
    if (!result){
    return;
  }

    chrome.runtime.sendMessage({
      type: "ACTION_CLICKED",
      payload: {
        id: result.id,
        text: result.text,
        url: normalizeUrl(location.href),
        context: result.context,
        color: "yellow",
      },
    });
    hideToolbar();
  };

  const onDelete = () => {
    const id = toolbarState.highlightId;
    if (!id){
      return;
    }

    removeHighlight(id);
    chrome.runtime.sendMessage({
      type: "DELETE_HIGHLIGHT",
      payload: { id },
    });

    hideToolbar();
    // setToolbarState((current) => ({ ...current, visible: false, highlightId: null }));

  };

  return (
    <Toolbar
      visible={toolbarState.visible}
      x={toolbarState.x}
      y={toolbarState.y}
      theme={toolbarState.theme}
      canDelete={toolbarState.highlightId !== null}
      onHighlight={onHighlight}
      onDelete={onDelete}
    />
  );
};

ReactDOM.createRoot(mountPoint).render(
  <React.StrictMode>
    <HighlighterRoot />
  </React.StrictMode>
);
