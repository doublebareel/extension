import { useState } from "react";
import Icon from "../../shared/components/icon/Icon";
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

const NoteViewer = (props: NoteViewerProps) => {
  const { visible, x, y, note, onSave, onMouseEnter, onMouseLeave } = props;

  const [editing, setEditing] = useState<boolean>(false);
  const [prevNote, setPrevNote] = useState<string>(note);
  const [prevVisible, setPrevVisible] = useState<boolean>(visible);

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
        // anchor by the bottom edge (10px above the highlight top) so the note grows upward and sits above the text instead of covering it
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
