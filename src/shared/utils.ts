export const normalizeUrl = (url: string): string => {
    const u = new URL(url);
    return u.origin + u.pathname;
}

export type Theme = "light" | "dark";

const parseColor = (color: string): { r: number; g: number; b: number; a: number } | null =>
{
    const match = color.match(/rgba?\(([^)]+)\)/);

    if (!match)
    {
        return null;
    }

    const parts = match[1].split(",").map(part => parseFloat(part.trim()));
    const [r, g, b, a = 1] = parts;

    return { r, g, b, a };
}

// Walk up the DOM until we find an element with a non-transparent background.
// Most elements report rgba(0,0,0,0), so the real color comes from an ancestor.
// Falls back to white, which is the browser's default page background.
const getEffectiveBackgroundColor = (element: Element | null): { r: number; g: number; b: number } =>
{
    let current: Element | null = element;

    while (current)
    {
        const color = parseColor(window.getComputedStyle(current).backgroundColor);

        if (color && color.a !== 0)
        {
            return { r: color.r, g: color.g, b: color.b };
        }

        current = current.parentElement;
    }

    return { r: 255, g: 255, b: 255 };
}

// WCAG relative luminance: weights each channel by perceived brightness.
const getRelativeLuminance = (r: number, g: number, b: number): number =>
{
    const toLinear = (value: number) =>
    {
        const normalized = value / 255;

        return normalized <= 0.03928
            ? normalized / 12.92
            : Math.pow((normalized + 0.055) / 1.055, 2.4);
    };

    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

// Returns the theme of the page behind `element`. A "dark" page background means
// the toolbar should render light, and vice versa.
export const detectBackgroundTheme = (element: Element | null): Theme =>
{
    const { r, g, b } = getEffectiveBackgroundColor(element);

    return getRelativeLuminance(r, g, b) < 0.5 ? "dark" : "light";
}