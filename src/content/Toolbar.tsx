import { useState } from "react";
import Button from "../shared/components/button/Button";
import Icon from "../shared/components/icon/Icon";
import Tooltip from "../shared/components/tooltip/Tooltip";
import Note from "./Note";

interface ToolbarProps {
  visible: boolean;
  x: number;
  y: number;
  canHighlight: boolean;
  canDelete: boolean;
  onHighlight: () => void;
  onDelete: () => void;
  onAddNote: () => boolean;
  onSaveNote: (note: string) => void;
}

const Toolbar = ({ visible, x, y, canHighlight, canDelete, onHighlight, onDelete, onAddNote, onSaveNote }: ToolbarProps) => {
  const [showNote, setShowNote] = useState<boolean>(false);

  // The component stays mounted (it returns null while hidden), so reset the
  // note whenever the toolbar is dismissed — otherwise it would reopen with the
  // next selection. Adjusting state during render is React's recommended pattern
  // for resetting on a prop change.
  if (!visible) {
    if (showNote) {
      setShowNote(false);
    }
    return null;
  }

  const handleAddNote = () => {
    if (!onAddNote()) {
      return;
    }
    setShowNote(true);
  };

  const handleCancelNote = () => {
    setShowNote(false);
  };

  return (
    <div
      id="toolbarComponent"
      style={{
        position: "fixed",
        left: x,
        // Anchor by the bottom edge (10px above the selection top) so the
        // toolbar — and the taller note — grow upward and stay above the text
        // instead of covering it.
        bottom: `calc(100vh - ${y}px + 10px)`,
        transform: "translateX(-50%)",
        zIndex: 999999,
        pointerEvents: "auto",
      }}
    >
      {!showNote && (
        <span id="actions">
          <div className="toolbarContainer">
            {/* Hidden when the selection overlaps an existing highlight, to
                prevent nested highlights. Note and color still act on the
                existing highlight. */}
            {canHighlight && (
              <Tooltip text="Highlight" position="top">
                <Button onClick={onHighlight} iconOnly type="tonal" size="md">
                  <Icon name="marker" size={16} />
                </Button>
              </Tooltip>
            )}

            <Tooltip text="Change Color" position="top">
              <Button iconOnly type="tonal" size="md">
                <Icon name="palette" size={16} />
              </Button>
            </Tooltip>

            <Tooltip text="Add Note" position="top">
              <Button iconOnly type="tonal" size="md" onClick={handleAddNote}>
                <Icon name="comment-lines" size={16} />
              </Button>
            </Tooltip>

            {canDelete && (
              <Tooltip text="Delete" position="top">
                <Button iconOnly onClick={onDelete} type="tonal" size="md">
                  <Icon name="delete" size={16} />
                </Button>
              </Tooltip>
            )}
          </div>
        </span>
      )}

      <Note show={showNote} onCancel={handleCancelNote} onSave={onSaveNote} />
    </div>
  );
};

export default Toolbar;
