import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

const Accordion = AccordionPrimitive.Root

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn(
      "border-b border-border/40 hover:border-border transition-colors duration-200 hover-glow",
      "dark:data-[state=open]:border-yellow-500/30 data-[state=open]:border-primary/40",
      className
    )}
    {...props}
  />
))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all relative [&[data-state=open]>svg]:rotate-180 group",
        "after:absolute after:bottom-3 after:left-0 after:h-[2px] after:w-0 after:bg-primary dark:after:bg-yellow-500 after:transition-all after:duration-300",
        "hover:after:w-full focus:after:w-full",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-300 text-muted-foreground group-hover:text-primary dark:group-hover:text-yellow-500" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn(
      "pb-4 pt-0 border-l-2 pl-4 ml-2 border-transparent dark:data-[state=open]:border-yellow-500/30 data-[state=open]:border-primary/30 transition-all duration-300 relative",
      "dark:data-[state=open]:after:absolute dark:data-[state=open]:after:left-0 dark:data-[state=open]:after:top-0 dark:data-[state=open]:after:w-full dark:data-[state=open]:after:h-full dark:data-[state=open]:after:bg-yellow-500/5 dark:data-[state=open]:after:rounded-md dark:data-[state=open]:after:-z-10",
      className
    )}>{children}</div>
  </AccordionPrimitive.Content>
))

AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
