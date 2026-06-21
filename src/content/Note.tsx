import { useEffect, useRef, useState } from "react";
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Seed the textarea from initialValue each time the editor opens (so editing
  // an existing note prefills its text), and collapse it on close. The component
  // stays mounted; adjusting state during render is React's recommended pattern.
  if (show !== prevShow) {
    setPrevShow(show);
    if (show) {
      setValue(initialValue);
    } else {
      setOpen(false);
    }
  }

  // Mount collapsed, then flip to the open state on the next frame so the
  // width/height transition actually runs instead of snapping to full size.
  // Also focus the textarea and drop the caret at the end of the prefilled text
  // (autoFocus alone leaves it at the start when editing an existing note).
  useEffect(() => {
    if (!show) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      setOpen(true);

      const textarea = textareaRef.current;
      if (textarea) {
        textarea.focus();
        const end = textarea.value.length;
        textarea.setSelectionRange(end, end);
      }
    });
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
      <textarea ref={textareaRef} placeholder="Add your note here..." rows={4} value={value} onChange={(event) => setValue(event.target.value)}></textarea>
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
