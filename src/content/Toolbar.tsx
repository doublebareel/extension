import Button from "../shared/components/button/Button";
import Icon from "../shared/components/icon/Icon";
import Tooltip from "../shared/components/tooltip/Tooltip";
import type { Theme } from "../shared/utils";

type ToolbarProps = {
  visible: boolean;
  x: number;
  y: number;
  theme: Theme;
  canDelete: boolean;
  onHighlight: () => void;
  onDelete: () => void;
};

const Toolbar = ({
  visible,
  x,
  y,
  theme,
  canDelete,
  onHighlight,
  onDelete,
}: ToolbarProps) => {
  if (!visible) {
    return null;
  }

  return (
    <div
      id="toolbarComponent"
      style={{
        position: "fixed",
        left: x,
        top: y - 50,
        transform: "translateX(-50%)",
        zIndex: 999999,
        pointerEvents: "auto",
      }}
    >
      <div className="toolbarContainer" data-theme={theme}>
        {/* <button onClick={onHighlight}>
          Highlight
        </button>

        <button onClick={onDelete}>
          Delete
        </button>
        <Icon name="delete" size={16} />  */}

        <Tooltip text="Highlight" position="top">
          <Button onClick={onHighlight} iconOnly type="tonal" size="md">
            <Icon name="marker" size={16} />
          </Button>
        </Tooltip>

        <Tooltip text="Change Color" position="top">
          <Button iconOnly type="tonal" size="md">
            <Icon name="palette" size={16} />
          </Button>
        </Tooltip>

        <Tooltip text="Add Note" position="top">
          <Button iconOnly type="tonal" size="md">
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
    </div>
  );
};

export default Toolbar;
