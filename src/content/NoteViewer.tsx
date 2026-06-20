import { useState } from "react";
import Icon from "../shared/components/icon/Icon";
import Note from "./Note";

interface NoteViewerProps {
  visible: boolean;
  x: number;
  y: number;
  note: string;
  onSave: (note: string) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

// Compact, borderless bubble shown when hovering a highlight that has a note.
// It sizes to its text (no fixed card) and reveals a small edit affordance on
// hover; clicking it opens the shared Note editor pre-filled with the note.
const NoteViewer = (props: NoteViewerProps) => {
  const { visible, x, y, note, onSave, onMouseEnter, onMouseLeave } = props;

  const [editing, setEditing] = useState<boolean>(false);
  const [prevNote, setPrevNote] = useState<string>(note);
  const [prevVisible, setPrevVisible] = useState<boolean>(visible);

  // Back to read-only on each (re)open or when the hovered note changes — the
  // component stays mounted (returns null while hidden), so without this it
  // would stay in edit mode from the previously hovered highlight.
  if (note !== prevNote || visible !== prevVisible) {
    setPrevNote(note);
    setPrevVisible(visible);
    if (visible) {
      setEditing(false);
    }
  }

  if (!visible) {
    return null;
  }

  return (
    <div
      id="noteViewerComponent"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        position: "fixed",
        left: x,
        // Anchor by the bottom edge (10px above the highlight top) so the note
        // grows upward and sits above the text instead of covering it.
        bottom: `calc(100vh - ${y}px + 10px)`,
        transform: "translateX(-50%)",
        zIndex: 999999,
        pointerEvents: "auto",
      }}
    >
      {editing ? (
        <Note show initialValue={note} onCancel={() => setEditing(false)} onSave={onSave} />
      ) : (
        <div className="noteViewerBubble">
          <textarea className="noteViewerText" value={note} readOnly rows={1} />
          <button type="button" className="noteViewerEdit" aria-label="Edit note" onClick={() => setEditing(true)}>
            <Icon name="edit" size={12} />
          </button>
        </div>
      )}
    </div>
  );
};

export default NoteViewer;
