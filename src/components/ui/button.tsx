import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--accent)] px-5 py-2.5 text-[var(--surface)] shadow-[0_16px_38px_rgba(31,58,51,0.18)] hover:-translate-y-0.5 hover:bg-[var(--accent-strong)] hover:shadow-[0_20px_44px_rgba(31,58,51,0.22)]",
        secondary:
          "bg-[var(--terracotta-soft)] px-5 py-2.5 text-[var(--accent-strong)] shadow-[0_12px_28px_rgba(47,111,82,0.12)] hover:-translate-y-0.5 hover:bg-[var(--surface-lift)]",
        outline:
          "border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-[var(--foreground)] shadow-[0_10px_24px_rgba(31,58,51,0.06)] hover:-translate-y-0.5 hover:border-[var(--terracotta)] hover:bg-[var(--surface-soft)]",
        ghost:
          "px-3.5 py-2 text-[var(--accent-strong)] hover:bg-[var(--surface-soft)]",
      },
      size: {
        default: "min-h-10",
        sm: "min-h-8 px-3 text-[10px] uppercase tracking-[0.18em]",
        lg: "min-h-11 px-5 text-sm",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
