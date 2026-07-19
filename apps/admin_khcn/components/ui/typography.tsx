import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// --- HEADING ---
const headingVariants = cva("text-foreground", {
  variants: {
    level: {
      h1: "text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight",
      h2: "text-xl md:text-2xl font-semibold",
      h3: "text-lg md:text-xl font-semibold",
      h4: "text-base md:text-lg font-semibold",
    },
  },
  defaultVariants: {
    level: "h1",
  },
});

export interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
  VariantProps<typeof headingVariants> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";
}

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, level, as, ...props }, ref) => {
    const Comp = as ? as : level || "h1";
    return (
      <Comp
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ref={ref as React.Ref<any>}
        className={cn(headingVariants({ level, className }))}
        {...props}
      />
    );
  }
);
Heading.displayName = "Heading";

// --- TEXT ---
const textVariants = cva("text-foreground", {
  variants: {
    variant: {
      default: "text-sm md:text-base",
      muted: "text-xs md:text-sm text-muted-foreground",
      small: "text-xs font-medium leading-none",
      large: "text-lg font-semibold",
      lead: "text-xl text-muted-foreground",
      error: "text-sm md:text-base text-destructive",
      success: "text-sm md:text-base text-emerald-600 dark:text-emerald-400",
      code: "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
    },
    weight: {
      default: "",
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    },
  },
  defaultVariants: {
    variant: "default",
    weight: "default",
  },
});

export interface TextProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
  VariantProps<typeof textVariants> {
  as?: "p" | "span" | "div" | "label" | "code" | "a";
}

const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ className, variant, weight, as = "p", ...props }, ref) => {
    const Comp = as as any;
    return (
      <Comp
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ref={ref as React.Ref<any>}
        className={cn(textVariants({ variant, weight, className }))}
        {...props}
      />
    );
  }
);
Text.displayName = "Text";

export { Heading, Text, headingVariants, textVariants };
