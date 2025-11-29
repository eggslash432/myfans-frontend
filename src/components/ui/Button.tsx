// front/src/components/ui/Button.tsx
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline";
  size?: "md" | "sm";
  children: ReactNode;
};

export function Button({ variant = "primary", size = "md", children, className = "", ...rest }: Props) {
  const cls =
    "btn " +
    (variant === "primary" ? "btn-primary " : "btn-outline ") +
    (size === "sm" ? "btn-sm " : "") +
    className;

  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
