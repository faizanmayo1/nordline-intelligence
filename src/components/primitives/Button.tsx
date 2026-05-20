import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

const BASE =
  "inline-flex items-center justify-center gap-2 font-sans font-medium " +
  "transition-[background-color,color,border-color,transform] duration-150 ease-out " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--paper)] " +
  "disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap select-none rounded-[3px]";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-[color:var(--accent)] text-[color:var(--ink-on-accent)] hover:brightness-110 active:brightness-95",
  secondary:
    "bg-[color:var(--panel)] text-[color:var(--ink)] border border-[color:var(--hairline-strong)] hover:bg-[color:var(--panel-soft)]",
  outline:
    "bg-transparent text-[color:var(--ink)] border border-[color:var(--hairline-strong)] hover:bg-[color:var(--panel-soft)]",
  ghost:
    "bg-transparent text-[color:var(--ink-muted)] hover:text-[color:var(--ink)] hover:bg-[color:var(--panel-soft)]",
  danger:
    "bg-[color:var(--breach)] text-[color:var(--paper)] hover:brightness-110",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "text-[12px] h-7 px-2.5 tracking-wide",
  md: "text-[13px] h-9 px-3.5 tracking-wide",
  lg: "text-[14px] h-11 px-5 tracking-wide",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", asChild, ...rest }, ref) => {
    const Comp: any = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(BASE, VARIANTS[variant], SIZES[size], className)}
        {...rest}
      />
    );
  },
);
Button.displayName = "Button";
