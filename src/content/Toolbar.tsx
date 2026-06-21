import { useState } from "react";
import Button from "../shared/components/button/Button";
import Icon from "../shared/components/icon/Icon";
import Tooltip from "../shared/components/tooltip/Tooltip";
import type { HighlightStyle } from "../shared/types";
import Note from "./Note";
import Palette from "./Palette";
import { DEFAULT_HIGHLIGHT_COLOR, DEFAULT_HIGHLIGHT_STYLE } from "./paletteOptions";

interface ToolbarProps {
  visible: boolean;
  x: number;
  y: number;
  canHighlight: boolean;
  canDelete: boolean;
  // Existing note text for the selected highlight, prefilled into the editor.
  initialNote: string;
  onHighlight: (color: string, style: HighlightStyle) => void;
  onRestyle: (color: string, style: HighlightStyle) => void;
  onDelete: () => void;
  onAddNote: () => boolean;
  onSaveNote: (note: string, color: string, style: HighlightStyle) => void;
}

const Toolbar = ({ visible, x, y, canHighlight, canDelete, initialNote, onHighlight, onRestyle, onDelete, onAddNote, onSaveNote }: ToolbarProps) => {
  const [showNote, setShowNote] = useState<boolean>(false);
  const [showPalette, setShowPalette] = useState<boolean>(false);
  const [color, setColor] = useState<string>(DEFAULT_HIGHLIGHT_COLOR);
  const [style, setStyle] = useState<HighlightStyle>(DEFAULT_HIGHLIGHT_STYLE);

  // The component stays mounted (it returns null while hidden), so reset the
  // open popovers whenever the toolbar is dismissed — otherwise they would
  // reopen with the next selection. Adjusting state during render is React's
  // recommended pattern for resetting on a prop change.
  if (!visible) {
    if (showNote) {
      setShowNote(false);
    }
    if (showPalette) {
      setShowPalette(false);
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

  // For a new selection the palette only stages the choice (applied when the
  // Highlight button is clicked); when the selection overlaps an existing
  // highlight there is no Highlight button, so apply to it immediately.
  const handleColorChange = (nextColor: string) => {
    setColor(nextColor);
    if (!canHighlight) {
      onRestyle(nextColor, style);
    }
  };

  const handleStyleChange = (nextStyle: HighlightStyle) => {
    setStyle(nextStyle);
    if (!canHighlight) {
      onRestyle(color, nextStyle);
    }
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
      {/* Sits above the toolbar so it opens "over" the buttons. */}
      <Palette show={showPalette && !showNote} color={color} style={style} onColorChange={handleColorChange} onStyleChange={handleStyleChange} />

      {!showNote && (
        <span id="actions">
          <div className="toolbarContainer">
            {/* Hidden when the selection overlaps an existing highlight, to
                prevent nested highlights. Note and color still act on the
                existing highlight. */}
            {canHighlight && (
              <Tooltip text="Highlight" position="top">
                <Button onClick={() => onHighlight(color, style)} iconOnly type="tonal" size="md">
                  <Icon name="marker" size={16} />
                </Button>
              </Tooltip>
            )}

            <Tooltip text="Change Color" position="top">
              <Button iconOnly type="tonal" size="md" onClick={() => setShowPalette(!showPalette)}>
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

      <Note show={showNote} initialValue={initialNote} onCancel={handleCancelNote} onSave={(note) => onSaveNote(note, color, style)} />
    </div>
  );
};

export default Toolbar;
