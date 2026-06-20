import { useEffect, useState } from "react";
import Button from "../shared/components/button/Button";

interface NoteProps {
  show: boolean;
  // Pre-fills the editor — empty for a brand new note, the existing text when
  // editing one from the note viewer.
  initialValue?: string;
  onCancel: () => void;
  onSave: (note: string) => void;
}

const Note = (props: NoteProps) => {
  const { show, initialValue = "", onCancel, onSave } = props;

  const [open, setOpen] = useState<boolean>(false);
  const [value, setValue] = useState<string>(initialValue);
  const [prevShow, setPrevShow] = useState<boolean>(show);

  // Reset the note state when it is dismissed (the component stays mounted).
  // Adjusting state during render is React's recommended pattern for this.
  if (show !== prevShow) {
    setPrevShow(show);
    if (!show) {
      setOpen(false);
      setValue(initialValue);
    }
  }

  // Mount collapsed, then flip to the open state on the next frame so the
  // width/height transition actually runs instead of snapping to full size.
  useEffect(() => {
    if (!show) {
      return;
    }

    const frame = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(frame);
  }, [show]);

  if (!show) {
    return null;
  }

  const handleSave = () => {
    if (value.trim() === "") {
      return;
    }
    onSave(value);
  };

  return (
    <div id="noteContainer" className={open ? "noteContainer--open" : ""}>
      <textarea placeholder="Add your note here..." rows={4} value={value} onChange={(event) => setValue(event.target.value)} autoFocus></textarea>
      <div className="noteContainerActions">
        <Button palette="secondary" type="default" size="md" onClick={onCancel}>
          Cancel
        </Button>
        <Button palette="primary" type="default" size="md" disabled={value.trim() === ""} onClick={handleSave}>
          Save
        </Button>
      </div>
    </div>
  );
};

export default Note;
