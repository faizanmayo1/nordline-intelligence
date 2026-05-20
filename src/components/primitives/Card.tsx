import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  flush?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, flush, ...rest }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative bg-[color:var(--panel)] border border-[color:var(--hairline)]",
        // Subtle inset highlight in Night Mode via box-shadow inset; flat in Day
        "[html[data-theme='night']_&]:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)]",
        "rounded-[3px]",
        !flush && "p-5",
        className,
      )}
      {...rest}
    />
  ),
);
Card.displayName = "Card";

export interface CardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  kicker?: string;
  title?: ReactNode;
  action?: ReactNode;
}

export function CardHeader({
  kicker,
  title,
  action,
  className,
  children,
  ...rest
}: CardHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 mb-4",
        className,
      )}
      {...rest}
    >
      <div className="flex flex-col gap-1.5 min-w-0">
        {kicker ? (
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-muted)]">
            {kicker}
          </span>
        ) : null}
        {title ? (
          <h3 className="font-serif text-[20px] leading-tight text-[color:var(--ink)]">
            {title}
          </h3>
        ) : null}
        {children}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function CardTitle({
  className,
  ...rest
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "font-serif text-[20px] leading-tight text-[color:var(--ink)]",
        className,
      )}
      {...rest}
    />
  );
}

export function CardBody({
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("", className)} {...rest} />;
}

export function CardFooter({
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mt-4 pt-3 border-t border-[color:var(--hairline)] flex items-center justify-between gap-3",
        className,
      )}
      {...rest}
    />
  );
}
