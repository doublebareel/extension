import type { HighlightStyle } from "../../shared/types";

// Eight highlight colors, laid out as two rows of four. The first is the
// default so a highlight created without touching the palette stays yellow.
export const PALETTE_COLORS = ["#FEF08A", "#BBF7D0", "#BFDBFE", "#FBCFE8", "#FED7AA", "#DDD6FE", "#FECACA", "#99F6E4"];

export const DEFAULT_HIGHLIGHT_COLOR = PALETTE_COLORS[0];
export const DEFAULT_HIGHLIGHT_STYLE: HighlightStyle = "default";
