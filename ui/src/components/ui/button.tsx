import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center cursor-pointer gap-2 whitespace-nowrap rounded-sm text-sm font-medium transition-all duration-200 ease-in-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-[3px] focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",

        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/40",

        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",

        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",

        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",

        link: "text-primary underline-offset-4 hover:underline",

        brutal:
          "bg-yellow-300 text-black border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] " +
          "hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] " +
          "active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] " +
          "transition-all duration-300 ease-in-out",

        brutalDestructive:
          "bg-red-400 text-black border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] " +
          "hover:bg-red-500 hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] " +
          "active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] " +
          "transition-all duration-300 ease-in-out",
      },
      size: {
        default: "h-10 px-6 text-base",
        sm: "h-8 px-3 text-sm",
        lg: "h-12 px-8 text-lg",
        xl: "h-14 px-10 text-xl",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
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
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
