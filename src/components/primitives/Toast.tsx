import * as ToastPrimitive from "@radix-ui/react-toast";
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";
import { X } from "lucide-react";

interface ToastDescriptor {
  id: string;
  kicker?: string;
  title: string;
  description?: string;
}

interface ToastContextValue {
  push: (toast: Omit<ToastDescriptor, "id">) => void;
}

const ToastCtx = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastDescriptor[]>([]);

  const push = useCallback((toast: Omit<ToastDescriptor, "id">) => {
    const id = `t_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    setItems((prev) => [...prev, { ...toast, id }]);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastCtx.Provider value={value}>
      <ToastPrimitive.Provider swipeDirection="right" duration={4500}>
        {children}
        {items.map((t) => (
          <ToastRoot
            key={t.id}
            kicker={t.kicker}
            onOpenChange={(open) => {
              if (!open)
                setItems((prev) => prev.filter((x) => x.id !== t.id));
            }}
          >
            <div className="flex flex-col gap-1">
              <ToastTitle>{t.title}</ToastTitle>
              {t.description ? (
                <ToastDescription>{t.description}</ToastDescription>
              ) : null}
            </div>
            <ToastClose />
          </ToastRoot>
        ))}
        <ToastViewport />
      </ToastPrimitive.Provider>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

export const ToastViewport = forwardRef<
  ElementRef<typeof ToastPrimitive.Viewport>,
  ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...rest }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn(
      "fixed bottom-6 right-6 z-[100] flex flex-col gap-2 outline-none w-[360px] max-w-[90vw]",
      className,
    )}
    {...rest}
  />
));
ToastViewport.displayName = "ToastViewport";

interface ToastRootProps
  extends ComponentPropsWithoutRef<typeof ToastPrimitive.Root> {
  kicker?: string;
}

export const ToastRoot = forwardRef<
  ElementRef<typeof ToastPrimitive.Root>,
  ToastRootProps
>(({ className, kicker, children, ...rest }, ref) => (
  <ToastPrimitive.Root
    ref={ref}
    className={cn(
      "group bg-[color:var(--panel)] border border-[color:var(--hairline-strong)] rounded-[3px]",
      "px-4 py-3 flex items-start justify-between gap-3",
      "data-[state=open]:animate-in data-[state=open]:slide-in-from-right-full",
      "data-[state=closed]:animate-out data-[state=closed]:fade-out",
      "transition-all",
      className,
    )}
    {...rest}
  >
    {kicker ? (
      <div className="absolute -top-2 left-3 px-1 bg-[color:var(--panel)] text-[9px] font-mono uppercase tracking-[0.22em] text-[color:var(--accent)]">
        {kicker}
      </div>
    ) : null}
    {children}
  </ToastPrimitive.Root>
));
ToastRoot.displayName = "ToastRoot";

export const ToastTitle = forwardRef<
  ElementRef<typeof ToastPrimitive.Title>,
  ComponentPropsWithoutRef<typeof ToastPrimitive.Title>
>(({ className, ...rest }, ref) => (
  <ToastPrimitive.Title
    ref={ref}
    className={cn(
      "font-sans text-[13px] font-medium text-[color:var(--ink)]",
      className,
    )}
    {...rest}
  />
));
ToastTitle.displayName = "ToastTitle";

export const ToastDescription = forwardRef<
  ElementRef<typeof ToastPrimitive.Description>,
  ComponentPropsWithoutRef<typeof ToastPrimitive.Description>
>(({ className, ...rest }, ref) => (
  <ToastPrimitive.Description
    ref={ref}
    className={cn(
      "font-mono text-[11px] leading-snug text-[color:var(--ink-muted)]",
      className,
    )}
    {...rest}
  />
));
ToastDescription.displayName = "ToastDescription";

export function ToastClose() {
  return (
    <ToastPrimitive.Close
      className="text-[color:var(--ink-faint)] hover:text-[color:var(--ink)] transition-colors"
      aria-label="Dismiss"
    >
      <X size={14} />
    </ToastPrimitive.Close>
  );
}
