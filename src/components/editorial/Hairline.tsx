import { cn } from "@/lib/cn";

export interface HairlineProps {
  className?: string;
}

export function Hairline({ className }: HairlineProps) {
  return (
    <div
      className={cn(
        "h-px w-full bg-[color:var(--hairline)]",
        className,
      )}
      role="separator"
    />
  );
}

export function HairlineStrong({ className }: HairlineProps) {
  return (
    <div
      className={cn(
        "h-px w-full bg-[color:var(--hairline-strong)]",
        className,
      )}
      role="separator"
    />
  );
}

export function HairlineVertical({ className }: HairlineProps) {
  return (
    <div
      className={cn(
        "h-full w-px bg-[color:var(--hairline)]",
        className,
      )}
      role="separator"
    />
  );
}
