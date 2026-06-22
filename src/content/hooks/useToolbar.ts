import { useCallback, useEffect, useState } from "react";
import { setupHighlighter } from "../inject";

interface UseToolbarArgs {
  /*
   * Called right before the toolbar is shown for a fresh selection, so the open
   * note viewer can be closed first (the two must not coexist).
   */
  onBeforeShow: () => void;
}

/*
 * Owns the floating toolbar state and the setupHighlighter subscription that
 * raises/hides it on selection changes.
 */
export default function useToolbar({ onBeforeShow }: UseToolbarArgs) {
  const [toolbarState, setToolbarState] = useState({
    visible: false,
    x: 0,
    y: 0,
    highlightId: null as string | null,
    canHighlight: true,
  });

  const hide = useCallback(() => {
    setToolbarState((current) => (current.visible ? { ...current, visible: false } : current));
  }, []);

  useEffect(() => {
    const renderToolbar = (x: number, y: number, highlightId: string | null, canHighlight: boolean) => {
      onBeforeShow();
      setToolbarState({ visible: true, x, y, highlightId, canHighlight });
    };

    setupHighlighter(renderToolbar, hide);
  }, [onBeforeShow, hide]);

  return { toolbarState, hide };
}
