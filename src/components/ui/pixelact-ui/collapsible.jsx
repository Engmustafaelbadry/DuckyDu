"use client";;
import {
  Collapsible as ShadcnCollapsible,
  CollapsibleContent as ShadcnCollapsibleContent,
  CollapsibleTrigger as ShadcnCollapsibleTrigger,
} from "@radix-ui/react-collapsible";

import { cn } from "@/lib/utils";

import "@/components/ui/pixelact-ui/styles/styles.css";

function Collapsible({
  children,
  ...props
}) {
  const { className } = props;

  return (
    <div className={cn("relative", className)}>
      <ShadcnCollapsible
        {...props}
        className={cn("pixel-font font-normal text-foreground", className)}>
        {children}
      </ShadcnCollapsible>
    </div>
  );
}

function CollapsibleTrigger({
  children,
  ...props
}) {
  const { className } = props;
  return (
    <ShadcnCollapsibleTrigger
      data-slot="collapsible-trigger"
      className={cn("pixel-font", className)}
      {...props}>
      {children}
    </ShadcnCollapsibleTrigger>
  );
}

function CollapsibleContent({
  children,
  ...props
}) {
  const { className } = props;
  return (
    <ShadcnCollapsibleContent
      data-slot="collapsible-content"
      className={cn("pixel-font", className)}
      {...props}>
      {children}
    </ShadcnCollapsibleContent>
  );
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
