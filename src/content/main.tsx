import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import Toolbar from "./Toolbar";
import NoteViewer from "./NoteViewer";
import {
  higlightSelectedText,
  highlightWithNote,
  hasActiveSelection,
  setupHighlighter,
  setupNoteHover,
  removeHighlight,
  loadPageHighlights,
  markHighlightHasNote,
  clearSelectionState,
  restyleHighlight,
} from "./inject";
import type { HighlightStyle } from "../shared/types";
import styles from "./styles.scss?inline";
import { normalizeUrl } from "../shared/utils";

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
    highlightId: null as string | null,
    canHighlight: true,
  });

  // Notes for highlights on this page, keyed by highlight id. Held in a ref too
  // so the hover listener (registered once) always reads the latest map.
  const [notes, setNotes] = useState<Map<string, string>>(new Map());
  const notesRef = useRef(notes);

  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);

  const [viewerState, setViewerState] = useState({
    visible: false,
    x: 0,
    y: 0,
    highlightId: null as string | null,
    note: "",
  });

  const viewerHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearViewerHideTimer = useCallback(() => {
    if (viewerHideTimer.current !== null) {
      clearTimeout(viewerHideTimer.current);
      viewerHideTimer.current = null;
    }
  }, []);

  const hideViewer = useCallback(() => {
    setViewerState((current) => (current.visible ? { ...current, visible: false } : current));
  }, []);

  // Delay the hide so the pointer can cross the small gap from the highlight to
  // the popover (where onMouseEnter cancels it) without the note flickering away.
  const scheduleViewerHide = useCallback(() => {
    clearViewerHideTimer();
    viewerHideTimer.current = setTimeout(() => {
      viewerHideTimer.current = null;
      hideViewer();
    }, 200);
  }, [clearViewerHideTimer, hideViewer]);

  const hideToolbar = useCallback(() => {
    setToolbarState((current) => (current.visible ? { ...current, visible: false } : current));
  }, []);

  useEffect(() => {
    const renderToolbar = (x: number, y: number, highlightId: string | null, canHighlight: boolean) => {
      // The toolbar and the hover note must not coexist — a fresh selection
      // (which raises the toolbar) closes any open note viewer.
      clearViewerHideTimer();
      hideViewer();
      setToolbarState({ visible: true, x, y, highlightId, canHighlight });
    };

    setupHighlighter(renderToolbar, hideToolbar);

    loadPageHighlights().then((highlights) => {
      const map = new Map<string, string>();
      highlights.forEach((highlight) => {
        if (highlight.note) {
          map.set(highlight.id, highlight.note);
        }
      });
      setNotes(map);
    });
  }, [hideToolbar, clearViewerHideTimer, hideViewer]);

  useEffect(() => {
    const showNoteViewer = (x: number, y: number, highlightId: string) => {
      const note = notesRef.current.get(highlightId);
      if (!note) {
        return;
      }

      clearViewerHideTimer();
      setViewerState({ visible: true, x, y, highlightId, note });
    };

    return setupNoteHover(showNoteViewer, scheduleViewerHide);
  }, [clearViewerHideTimer, scheduleViewerHide]);

  const onHighlight = (color: string, style: HighlightStyle) => {
    const result = higlightSelectedText(color, style);
    if (!result) {
      return;
    }

    chrome.runtime.sendMessage({
      type: "ACTION_CLICKED",
      payload: {
        id: result.id,
        text: result.text,
        url: normalizeUrl(location.href),
        context: result.context,
        color,
        style,
      },
    });
    hideToolbar();
  };

  // Recolor / restyle an existing highlight when the palette acts on a selection
  // that overlaps one (which has no Highlight button to apply through).
  const onRestyle = (color: string, style: HighlightStyle) => {
    const id = toolbarState.highlightId;
    if (!id) {
      return;
    }

    restyleHighlight(id, color, style);
    chrome.runtime.sendMessage({
      type: "UPDATE_HIGHLIGHT",
      payload: { id, color, style },
    });
  };

  const onAddNote = (): boolean => {
    return hasActiveSelection();
  };

  const onSaveNote = (note: string, color: string, style: HighlightStyle) => {
    // When the selection overlaps an existing highlight, attach the note to that
    // whole highlight instead of nesting a new one.
    const existingId = toolbarState.highlightId;
    if (existingId) {
      markHighlightHasNote(existingId);
      setNotes((current) => {
        const next = new Map(current);
        next.set(existingId, note);
        return next;
      });

      chrome.runtime.sendMessage({
        type: "UPDATE_NOTE",
        payload: { id: existingId, note },
      });

      clearSelectionState();
      hideToolbar();
      return;
    }

    const result = highlightWithNote(note, color, style);
    if (!result) {
      hideToolbar();
      return;
    }

    // Register the note now so hovering the freshly created highlight shows it
    // immediately, instead of only after a reload repopulates the map.
    setNotes((current) => {
      const next = new Map(current);
      next.set(result.id, note);
      return next;
    });

    chrome.runtime.sendMessage({
      type: "ACTION_CLICKED",
      payload: {
        id: result.id,
        text: result.text,
        url: normalizeUrl(location.href),
        context: result.context,
        color,
        style,
        note,
      },
    });
    hideToolbar();
  };

  const onDelete = () => {
    const id = toolbarState.highlightId;
    if (!id) {
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

  const onEditNote = (note: string) => {
    const id = viewerState.highlightId;
    if (!id) {
      return;
    }

    setNotes((current) => {
      const next = new Map(current);
      next.set(id, note);
      return next;
    });

    chrome.runtime.sendMessage({
      type: "UPDATE_NOTE",
      payload: { id, note },
    });

    hideViewer();
  };

  return (
    <>
      <Toolbar
        visible={toolbarState.visible}
        x={toolbarState.x}
        y={toolbarState.y}
        canHighlight={toolbarState.canHighlight}
        canDelete={toolbarState.highlightId !== null}
        initialNote={(toolbarState.highlightId && notes.get(toolbarState.highlightId)) || ""}
        onHighlight={onHighlight}
        onRestyle={onRestyle}
        onDelete={onDelete}
        onAddNote={onAddNote}
        onSaveNote={onSaveNote}
      />
      <NoteViewer visible={viewerState.visible} x={viewerState.x} y={viewerState.y} note={viewerState.note} onSave={onEditNote} onMouseEnter={clearViewerHideTimer} onMouseLeave={scheduleViewerHide} />
    </>
  );
};

ReactDOM.createRoot(mountPoint).render(
  <React.StrictMode>
    <HighlighterRoot />
  </React.StrictMode>,
);
