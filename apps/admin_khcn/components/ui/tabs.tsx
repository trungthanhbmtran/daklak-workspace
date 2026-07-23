"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>
>(({ className, orientation = "horizontal", ...props }, ref) => (
  <TabsPrimitive.Root
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex",
      orientation === "horizontal" ? "flex-col" : "flex-row gap-4",
      className
    )}
    {...props}
  />
))
Tabs.displayName = TabsPrimitive.Root.displayName

const tabsListVariants = cva(
  "inline-flex flex-wrap items-center justify-center text-muted-foreground",
  {
    variants: {
      variant: {
        default: "h-auto min-h-10 rounded-md bg-muted p-1",
        line: "h-auto min-h-10 border-b rounded-none p-0 justify-start",
      },
      orientation: {
        horizontal: "",
        vertical: "flex-col h-auto w-auto justify-start",
      }
    },
    defaultVariants: {
      variant: "default",
      orientation: "horizontal"
    },
    compoundVariants: [
      {
        variant: "line",
        orientation: "vertical",
        className: "border-b-0 border-r"
      }
    ]
  }
)

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & VariantProps<typeof tabsListVariants>
>(({ className, variant, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(tabsListVariants({ variant }), className)}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
    iconStart?: React.ReactNode;
    iconEnd?: React.ReactNode;
    variant?: "default" | "line";
  }
>(({ className, iconStart, iconEnd, variant = "default", children, ...props }, ref) => {
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variant === "default" && "rounded-sm data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
        variant === "line" && "border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground rounded-none pb-2",
        className
      )}
      {...props}
    >
      {iconStart && <span className="mr-2 flex-shrink-0">{iconStart}</span>}
      {children}
      {iconEnd && <span className="ml-2 flex-shrink-0">{iconEnd}</span>}
    </TabsPrimitive.Trigger>
  )
})
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
