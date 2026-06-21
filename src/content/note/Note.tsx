import { useEffect, useRef, useState, type ChangeEvent } from "react";
import Button from "../../shared/components/button/Button";

interface NoteProps {
  show: boolean;
  initialValue?: string;
  onCancel: () => void;
  onSave: (note: string) => void;
}

interface NoteState {
  open: boolean;
  value: string;
  prevShow: boolean;
}

const Note = (props: NoteProps) => {
  const { show, initialValue = "", onCancel, onSave } = props;

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [noteState, setNoteState] = useState<NoteState>({
    open:false,
    value: initialValue,
    prevShow: show
  })

  if (show !== noteState.prevShow) {
    setNoteState({
      ...noteState,
      prevShow: show,
      value: show ? initialValue : noteState.value,
      open: show ? noteState.open : false,
    });
  }

  useEffect(() => {
    if (!show) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      setNoteState({
        ...noteState,
        open: true
      });

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
    if (noteState.value.trim() === "") {
      return;
    }
    onSave(noteState.value);
  };

  const handleValueChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setNoteState({
      ...noteState,
      value: event.target.value
    })
  };

  return (
    <div id="noteContainer" className={noteState.open ? "noteContainer--open" : ""}>
      <textarea 
        ref={textareaRef} 
        placeholder="Add your note here..." 
        rows={4} value={noteState.value} 
        onChange={handleValueChange}>
      
      </textarea>
      <div className="noteContainerActions">
        <Button palette="secondary" type="default" size="md" onClick={onCancel}>
          Cancel
        </Button>
        <Button palette="primary" type="default" size="md" 
          disabled={noteState.value.trim() === ""} 
          onClick={handleSave}>
          Save
        </Button>
      </div>
    </div>
  );
};

export default Note;
