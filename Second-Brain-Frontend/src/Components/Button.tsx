import type { ReactElement } from "react";

type Variants = "primary" | "secondary";

export interface ButtonProps {
  variant: Variants;
  size: "sm" | "md" | "lg";
  text: string;
  startIcon?: ReactElement;
  endIcon?: ReactElement;
  onClick?: () => void;
  fullwidth?: boolean;
  loading?: boolean;
}

const sizeStyles = {
  sm: "py-1 px-2 text-sm rounded-sm",
  md: "py-2 px-4 text-md rounded-md",
  lg: "py-4 px-6 text-sm rounded-xl",
};

const defaultStyles = "rounded-md px-4 py-2 flex font-normal";

const VariantStyles = {
  primary: "bg-purple-600 text-white",
  secondary: "bg-purple-300 text-purple-600",
};

export const Button = (props: ButtonProps) => {
  return (
    <button
      className={`flex items-center justify-center ${
        VariantStyles[props.variant]
      } ${defaultStyles} ${sizeStyles[props.size]} ${
        props.fullwidth ? "w-full" : ""
      } ${props.loading ? "opacity-45" : ""}`}
      onClick={props.onClick}
      disabled={props.loading}
    >
      <div className="flex items-center">
        <span className="text-xs">{props.startIcon}</span>
        <div className="pl-2 pr-2">{props.text}</div>
        {props.endIcon}
      </div>
    </button>
  );
};
