import "./styles.scss";

// Eagerly bundle every SVG in `public/icons` as a raw string. The content
// script is an IIFE with no runtime access to the file system, so the markup
// has to be inlined at build time rather than fetched. Keyed by file name.
// The SVGs themselves use `currentColor` and carry no fixed size, so the
// defaults below are the only place color/size are decided.
const iconModules = import.meta.glob<string>("../../../../public/icons/*.svg", {
  query: "?raw",
  import: "default",
  eager: true,
});

const iconsByName: Record<string, string> = {};

for (const path in iconModules) {
  const fileName = path.split("/").pop();

  if (fileName) {
    iconsByName[fileName.replace(/\.svg$/, "")] = iconModules[path];
  }
}

interface IconProps {
  name: string;
  size?: number;
}

const DEFAULT_SIZE = 20;
const Icon = (props: IconProps) => {
  const { name, size = DEFAULT_SIZE } = props;

  const raw = iconsByName[name];

  if (!raw) {
    return null;
  }

  const style = {
    width: size,
    height: size,
  } as React.CSSProperties;

  return (
    <span
      className="icon"
      style={style}
      dangerouslySetInnerHTML={{ __html: raw }}
    />
  );
};

export default Icon;
