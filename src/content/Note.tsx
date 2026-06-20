import { useEffect, useState } from "react";
import Button from "../shared/components/button/Button";

type NoteMode = "create" | "view";

interface NoteProps {
  show: boolean;
  // "create" opens straight into an empty editor; "view" shows the existing
  // note read-only until the user clicks Edit.
  mode?: NoteMode;
  initialValue?: string;
  onCancel: () => void;
  onSave: (note: string) => void;
}

const Note = (props: NoteProps) => {
  const { show, mode = "create", initialValue = "", onCancel, onSave } = props;

  const [open, setOpen] = useState<boolean>(false);
  const [value, setValue] = useState<string>(initialValue);
  const [editing, setEditing] = useState<boolean>(mode === "create");
  const [prevShow, setPrevShow] = useState<boolean>(show);

  // Re-seed the note state every time it opens (the component can stay mounted),
  // so a fresh selection — or hovering a different highlight — doesn't inherit
  // stale text. Adjusting state during render is React's recommended pattern.
  if (show !== prevShow) {
    setPrevShow(show);
    if (show) {
      setValue(initialValue);
      setEditing(mode === "create");
    } else {
      setOpen(false);
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

  const handleCancel = () => {
    // In view mode, Cancel backs out of editing to the read-only note rather
    // than dismissing the whole popover.
    if (mode === "view") {
      setValue(initialValue);
      setEditing(false);
      return;
    }
    onCancel();
  };

  return (
    <div id="noteContainer" className={open ? "noteContainer--open" : ""}>
      <textarea placeholder="Add your note here..." rows={4} value={value} readOnly={!editing} onChange={(event) => setValue(event.target.value)} autoFocus={editing}></textarea>
      <div className="noteContainerActions">
        {editing ? (
          <>
            <Button palette="secondary" type="default" size="md" onClick={handleCancel}>
              Cancel
            </Button>
            <Button palette="primary" type="default" size="md" disabled={value.trim() === ""} onClick={handleSave}>
              Save
            </Button>
          </>
        ) : (
          <Button palette="primary" type="default" size="md" onClick={() => setEditing(true)}>
            Edit
          </Button>
        )}
      </div>
    </div>
  );
};

export default Note;
