import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import {
  Tooltip as ShadcnTooltip,
  TooltipProvider as ShadcnTooltipProvider,
  TooltipTrigger as ShadcnTooltipTrigger,
} from "@/components/ui/tooltip";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import "@/components/ui/pixelact-ui/styles/styles.css";

export const tooltipVariants = cva(
  "bg-background text-foreground shadow-(--pixel-box-shadow) box-shadow-margin rounded-none",
  {
    variants: {
      font: {
        normal: "",
        pixel: "pixel-font",
      },
    },
    defaultVariants: {
      font: "pixel",
    },
  }
);

function TooltipContent({
  className,
  children,
  sideOffset = 10,
  font,
  ...props
}) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) px-3 py-2 text-xs text-balance",
          tooltipVariants({ font }),
          className
        )}
        {...props}>
        {children}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

function Tooltip({
  children,
  ...props
}) {
  return (
    <ShadcnTooltip data-slot="tooltip" {...props}>
      {children}
    </ShadcnTooltip>
  );
}

function TooltipProvider({
  children,
  delayDuration = 0,
  ...props
}) {
  return (
    <ShadcnTooltipProvider delayDuration={delayDuration} {...props}>
      {children}
    </ShadcnTooltipProvider>
  );
}

function TooltipTrigger({
  children,
  asChild = true,
  ...props
}) {
  return (
    <ShadcnTooltipTrigger data-slot="tooltip-trigger" asChild={asChild} {...props}>
      {children}
    </ShadcnTooltipTrigger>
  );
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
