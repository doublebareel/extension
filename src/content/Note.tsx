import Button from "../shared/components/button/Button";

interface NoteProps {
    show: boolean;
    handleAddNote?: () => void;
}

const Note = (props: NoteProps) => {


    if(!props.show) {
        return;
    }
  return (
    <div id="noteContainer">

        <textarea placeholder="Add your note here..." rows={4} cols={50}></textarea>
        <Button type="default" size="md">Cancle</Button>
        <Button type="default" size="md">Save</Button>
    </div>
  )
}

export default Note