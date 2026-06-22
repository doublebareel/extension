import { useEffect, useState, type CSSProperties } from "react";
import type { HighlightStyle } from "../../shared/types";
import { PALETTE_COLORS } from "./paletteOptions";

interface StyleOption {
  id: HighlightStyle;
  label: string;
}

const STYLE_OPTIONS: StyleOption[] = [
  { id: "default", label: "Aa" },
  { id: "underline", label: "Aa" },
  { id: "wave", label: "Aa" },
  { id: "strike", label: "Aa" },
];

interface PaletteProps {
  show: boolean;
  color: string;
  style: HighlightStyle;
  onColorChange: (color: string) => void;
  onStyleChange: (style: HighlightStyle) => void;
}

const previewStyleFor = (style: HighlightStyle, color: string): CSSProperties => {
  switch (style) {
    case "underline":
      return { textDecoration: "underline", textDecorationColor: color, textDecorationThickness: "3px" };
    case "wave":
      return { textDecoration: "underline", textDecorationStyle: "wavy", textDecorationColor: color };
    case "strike":
      return { textDecoration: "line-through", textDecorationColor: color, textDecorationThickness: "3px" };
    default:
      return { backgroundColor: color, color: "#000" };
  }
};

const Palette = (props: PaletteProps) => {
  const { show, color, style, onColorChange, onStyleChange } = props;

  const [open, setOpen] = useState<boolean>(false);
  const [prevShow, setPrevShow] = useState<boolean>(show);

  if (show !== prevShow) {
    setPrevShow(show);
    if (!show) {
      setOpen(false);
    }
  }

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

  const rows = [PALETTE_COLORS.slice(0, 4), PALETTE_COLORS.slice(4)];

  return (
    <div id="paletteContainer" className={open ? "paletteContainer--open" : ""}>
      <div className="colorsPicker">
        {rows.map((row, rowIndex) => (
          <div className="colorRow" key={rowIndex}>
            {row.map((swatch) => (
              <button
                type="button"
                key={swatch}
                className={swatch === color ? "colorSwatch selected" : "colorSwatch"}
                style={{ backgroundColor: swatch }}
                aria-label={`Highlight color ${swatch}`}
                aria-pressed={swatch === color}
                onClick={() => onColorChange(swatch)}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="textStylePicker">
        {STYLE_OPTIONS.map((option) => (
          <button
            type="button"
            key={option.id}
            className={option.id === style ? "tile active" : "tile"}
            aria-label={`Highlight style ${option.id}`}
            aria-pressed={option.id === style}
            onClick={() => onStyleChange(option.id)}
          >
            <span style={previewStyleFor(option.id, color)}>{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Palette;
