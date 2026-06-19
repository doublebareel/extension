import { useState, type ReactNode } from "react";
import "./Styles.scss";

type TooltipPosition = "top" | "bottom" | "left" | "right";

interface TooltipProps {
  text: string;
  children: ReactNode;
  position?: TooltipPosition;
  arrow?: boolean;
  spacing?: number;
}

const Tooltip = ({
  text,
  children,
  position = "top",
  arrow = false,
  spacing = 8,
}: TooltipProps) => {
  const [visible, setVisible] = useState(false);

  const showTooltip = () => {
    setVisible(true);
  };

  const hideTooltip = () => {
    setVisible(false);
  };

  return (
    <span
      className="tooltip-wrapper"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onClick={hideTooltip}
    >
      {children}

      {visible && (
        <span
          role="tooltip"
          className={`tooltip tooltip--${position}`}
          style={{ "--tooltip-spacing": `${spacing}px` } as React.CSSProperties}
        >
          {text}
          {arrow && <span className="tooltip-arrow" />}
        </span>
      )}
    </span>
  );
};

export default Tooltip;
