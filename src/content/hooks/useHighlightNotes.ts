import { useCallback, useEffect, useState } from "react";
import { loadPageHighlights } from "../inject";
import useLatestRef from "./useLatestRef";

/**
 *
 * Owns the per-page notes map (keyed by highlight id): its state, a latest-ref
 * for the hover listener, the initial population from storage, and the single
 * immutable write path.
 */
export default function useHighlightNotes() {
  const [notes, setNotes] = useState<Map<string, string>>(new Map());

  const notesRef = useLatestRef(notes);

  useEffect(() => {
    loadPageHighlights().then((highlights) => {
      const map = new Map<string, string>();
      highlights.forEach((highlight) => {
        if (highlight.note) {
          map.set(highlight.id, highlight.note);
        }
      });
      setNotes(map);
    });
  }, []);

  const upsertNote = useCallback((id: string, note: string) => {
    setNotes((current) => {
      const next = new Map(current);
      next.set(id, note);
      return next;
    });
  }, []);

  return { notes, notesRef, upsertNote };
}
