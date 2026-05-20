import { useEffect, useRef, useState } from "react";

export interface AnimatedNumberProps {
  value: number;
  durationMs?: number;
  format?: (n: number) => string;
  className?: string;
  style?: React.CSSProperties;
}

export function AnimatedNumber({
  value,
  durationMs = 700,
  format = (n) => n.toLocaleString("en-US", { maximumFractionDigits: 0 }),
  className,
  style,
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    fromRef.current = display;
    startRef.current = null;
    let raf = 0;
    const tick = (t: number) => {
      if (startRef.current === null) startRef.current = t;
      const p = Math.min(1, (t - startRef.current) / durationMs);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - p, 3);
      const current = fromRef.current + (value - fromRef.current) * eased;
      setDisplay(current);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, durationMs]);

  return (
    <span className={className} style={style}>
      {format(display)}
    </span>
  );
}
