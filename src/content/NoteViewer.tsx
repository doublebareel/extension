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

// Floating read-only note shown when hovering a highlight that has a note. It
// keeps itself open while the pointer is over it (onMouseEnter/Leave) so the
// user can reach the Edit button without the popover dismissing.
const NoteViewer = ({ visible, x, y, note, onSave, onMouseEnter, onMouseLeave }: NoteViewerProps) => {
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
      <Note show={visible} mode="view" initialValue={note} onSave={onSave} onCancel={() => {}} />
    </div>
  );
};

export default NoteViewer;
