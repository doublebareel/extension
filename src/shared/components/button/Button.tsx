import "./Styles.scss";

type ButtonType = "default" | "outline" | "tonal";
type ButtonPalette = "primary" | "secondary";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  type?: ButtonType;
  palette?: ButtonPalette;
  size?: ButtonSize;
  iconOnly?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
}

const Button = (props: ButtonProps) => {
  const {
    type = "default",
    palette = "primary",
    size = "md",
    iconOnly = false,
    onClick,
    disabled = false,
    children,
  } = props;

  const className = `button button--${type} button--${palette} button--${size}${iconOnly ? " button--icon-only" : ""}`;

  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
