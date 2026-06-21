import { useState } from "react";
import Button from "../shared/components/button/Button";
import Icon from "../shared/components/icon/Icon";
import Tooltip from "../shared/components/tooltip/Tooltip";
import type { HighlightStyle } from "../shared/types";
import Note from "./note/Note";
import Palette from "./palette/Palette";
import { DEFAULT_HIGHLIGHT_COLOR, DEFAULT_HIGHLIGHT_STYLE } from "./palette/paletteOptions";


/**
 * The toolbar that menages the highlight, restyle, delete, and note actions for a selected text.
 */
interface ToolbarProps {

  visible: boolean;
  x: number;
  y: number;
  canHighlight: boolean;
  canDelete: boolean;
  initialNote: string;

  /**
   * Highlights the selected text with the specified color and style.
   * 
   * @param color - the color to higlight the text.
   * @param style - they style to higlight the text.
   */
  onHighlight: (color: string, style: HighlightStyle) => void;

  /**
   * Handles the restyleing of an existing higlight. Sets the new color and style for the higlight.
   * 
   * @param color - The new color for the higlight.
   * @param style - the new style for the higlight.
   */
  onRestyle: (color: string, style: HighlightStyle) => void;

  /**
   * Deletes the selected text.
   */
  onDelete: () => void;

  /**
   * Adds a new note.
   * 
   * @returns A boolean indicating wheather the note can be added.
   */
  onAddNote: () => boolean;

  /**
   * Saves a note with the specified color and style.
   * 
   * @param note - The note to save.
   * @param color - The color of the note.
   * @param style - The style of the note.
   * 
   * @returns A boolean indicating whether the note was saved successfully.
   */
  onSaveNote: (note: string, color: string, style: HighlightStyle) => void;
}

interface PaletteState {
  show: boolean;
  color: string;
  style: HighlightStyle;
}

const Toolbar = ({ visible, x, y, canHighlight, canDelete, initialNote, onHighlight, onRestyle, onDelete, onAddNote, onSaveNote }: ToolbarProps) => {
  const [showNote, setShowNote] = useState<boolean>(false);
  const [paletteState, setPaletteState] = useState<PaletteState>({
    show: false,
    color: DEFAULT_HIGHLIGHT_COLOR,
    style: DEFAULT_HIGHLIGHT_STYLE,
  })

  if (!visible) {
    if (showNote) {
      setShowNote(false);
    }
    if (paletteState.show) {
      setPaletteState({
        ...paletteState,
        show: false
      })
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

  const handleColorChange = (nextColor: string) => {
    setPaletteState({...paletteState, color: nextColor });
    if (!canHighlight) {
      onRestyle(nextColor, paletteState.style);
    }
  };

  const handleStyleChange = (nextStyle: HighlightStyle) => {
    setPaletteState({...paletteState, style: nextStyle });
    if (!canHighlight) {
      onRestyle(paletteState.color, nextStyle);
    }
  };

  return (
    <div
      id="toolbarComponent"
      style={{
        position: "fixed",
        left: x,
        bottom: `calc(100vh - ${y}px + 10px)`,
        transform: "translateX(-50%)",
        zIndex: 999999,
        pointerEvents: "auto",
      }}
    >
      <Palette show={paletteState.show && !showNote} color={paletteState.color} style={paletteState.style} onColorChange={handleColorChange} onStyleChange={handleStyleChange} />

      {!showNote && (
        <span id="actions">
          <div className="toolbarContainer">
            {canHighlight && (
              <Tooltip text="Highlight" position="top">
                <Button onClick={() => onHighlight(paletteState.color, paletteState.style)} iconOnly type="tonal" size="md">
                  <Icon name="marker" size={16} />
                </Button>
              </Tooltip>
            )}

            <Tooltip text="Change Color" position="top">
              <Button iconOnly type="tonal" size="md" 
                onClick={() => setPaletteState({ ...paletteState, show: !paletteState.show })}>
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

      <Note show={showNote} initialValue={initialNote} onCancel={handleCancelNote} onSave={(note) => onSaveNote(note, paletteState.color, paletteState.style)} />
    </div>
  );
};

export default Toolbar;
