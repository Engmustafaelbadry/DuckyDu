import * as React from "react";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import {
  Breadcrumb as ShadcnBreadcrumb,
  BreadcrumbList as ShadcnBreadcrumbList,
  BreadcrumbItem as ShadcnBreadcrumbItem,
  BreadcrumbPage as ShadcnBreadcrumbPage,
  BreadcrumbSeparator as ShadcnBreadcrumbSeparator,
  BreadcrumbEllipsis as ShadcnBreadcrumbEllipsis,
} from "@/components/ui/breadcrumb";

import { Slot } from "@radix-ui/react-slot";
import { MoreHorizontal } from "lucide-react";

const breadcrumbVariants = cva("", {
  variants: {
    font: {
      normal: "",
      pixel: "pixel-font",
    },
    variant: {
      default: "text-foreground",
      destructive:
        "text-destructive [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

function Breadcrumb({
  variant,
  font,
  className,
  ...props
}) {
  return (
    <ShadcnBreadcrumb
      className={cn(breadcrumbVariants({ variant, font }), className)}
      {...props} />
  );
}

function BreadcrumbList({
  variant,
  className,
  ...props
}) {
  return (<ShadcnBreadcrumbList className={cn(breadcrumbVariants({ variant }), className)} {...props} />);
}

function BreadcrumbItem({
  variant,
  className,
  ...props
}) {
  return (<ShadcnBreadcrumbItem className={cn(breadcrumbVariants({ variant }), className)} {...props} />);
}

function BreadcrumbLink({
  variant,
  className,
  asChild,
  ...props
}) {
  const Comp = asChild ? Slot : "a";

  return (<Comp className={cn(breadcrumbVariants({ variant }), className)} {...props} />);
}

function BreadcrumbPage({
  variant,
  className,
  ...props
}) {
  return (<ShadcnBreadcrumbPage className={cn(breadcrumbVariants({ variant }), className)} {...props} />);
}

function BreadcrumbSeparator({
  variant,
  className,
  ...props
}) {
  return (
    <ShadcnBreadcrumbSeparator className={cn(breadcrumbVariants({ variant }), className)} {...props}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        viewBox="0 0 24 24">
        <path
          className="fill-foreground"
          d="M8 5v2h2V5zm4 4V7h-2v2zm2 2V9h-2v2zm0 2h2v-2h-2zm-2 2v-2h2v2zm0 0h-2v2h2zm-4 4v-2h2v2z" />
      </svg>
    </ShadcnBreadcrumbSeparator>
  );
}

function BreadcrumbEllipsis({
  variant,
  className,
  ...props
}) {
  return (
    <ShadcnBreadcrumbEllipsis className={cn(breadcrumbVariants({ variant }), className)} {...props}>
      <MoreHorizontal className={"size-7 pixel-font"} />
      <span className="sr-only">More</span>
    </ShadcnBreadcrumbEllipsis>
  );
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};
