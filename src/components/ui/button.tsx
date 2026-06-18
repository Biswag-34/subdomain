import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--ring] focus-visible:ring-offset-2 focus-visible:ring-offset-[--background] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-[linear-gradient(135deg,var(--accent),var(--accent-strong))] px-5 py-2.5 text-white shadow-[0_16px_38px_rgba(180,22,34,0.22)] hover:-translate-y-0.5 hover:shadow-[0_20px_44px_rgba(180,22,34,0.28)]",
        secondary:
          "border border-[rgba(234,28,41,0.22)] bg-[rgba(234,28,41,0.1)] px-5 py-2.5 text-[--accent-strong] hover:-translate-y-0.5 hover:bg-[rgba(234,28,41,0.16)]",
        outline:
          "border border-[rgba(234,28,41,0.2)] bg-white px-4 py-2.5 text-[--foreground] shadow-[0_10px_24px_rgba(234,28,41,0.06)] hover:-translate-y-0.5 hover:border-[--accent]/45 hover:bg-[--surface-soft]",
        ghost:
          "px-3.5 py-2 text-[--accent-strong] hover:bg-[--surface-soft]",
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
