import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import {
  AlertDialog as ShadcnAlertDialog,
  AlertDialogTrigger as ShadcnAlertDialogTrigger,
  AlertDialogContent as ShadcnAlertDialogContent,
  AlertDialogDescription as ShadcnAlertDialogDescription,
  AlertDialogFooter as ShadcnAlertDialogFooter,
  AlertDialogHeader as ShadcnAlertDialogHeader,
  AlertDialogOverlay as ShadcnAlertDialogOverlay,
  AlertDialogPortal as ShadcnAlertDialogPortal,
  AlertDialogTitle as ShadcnAlertDialogTitle,
} from "@/components/ui/alert-dialog";

import "@/components/ui/pixelact-ui/styles/styles.css";

export const alertDialogVariants = cva("", {
  variants: {
    font: {
      normal: "",
      pixel: "pixel-font",
    },
  },
  defaultVariants: {
    font: "pixel",
  },
});

function AlertDialog({
  ...props
}) {
  return <ShadcnAlertDialog {...props} />;
}

function AlertDialogTrigger({
  className,
  asChild = true,
  ...props
}) {
  return (<ShadcnAlertDialogTrigger className={cn(className)} asChild={asChild} {...props} />);
}

function AlertDialogPortal({
  ...props
}) {
  return <ShadcnAlertDialogPortal {...props} />;
}

function AlertDialogOverlay({
  className,
  ...props
}) {
  return <ShadcnAlertDialogOverlay className={cn(className)} {...props} />;
}

function AlertDialogContent({
  className,
  children,
  font,
  ...props
}) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <>
        <ShadcnAlertDialogContent
          className={cn(
            "rounded-none shadow-(--pixel-box-shadow) box-shadow-margin",
            alertDialogVariants({ font }),
            className
          )}
          {...props}>
          {children}
        </ShadcnAlertDialogContent>
      </>
    </AlertDialogPortal>
  );
}

function AlertDialogHeader({
  className,
  ...props
}) {
  return <ShadcnAlertDialogHeader className={cn(className)} {...props} />;
}

function AlertDialogFooter({
  className,
  ...props
}) {
  return (
    <ShadcnAlertDialogFooter
      className={cn(
        "flex flex-col-reverse sm:flex-row gap-4 sm:items-center sm:justify-end",
        className
      )}
      {...props} />
  );
}

function AlertDialogTitle({
  className,
  ...props
}) {
  return (<ShadcnAlertDialogTitle className={cn("font-normal text-foreground", className)} {...props} />);
}

function AlertDialogDescription({
  className,
  ...props
}) {
  return <ShadcnAlertDialogDescription className={cn(className)} {...props} />;
}

function AlertDialogAction({
  className,
  ...props
}) {
  return (<ShadcnAlertDialogTrigger className={cn("w-full md:w-auto", className)} {...props} />);
}

function AlertDialogCancel({
  className,
  ...props
}) {
  return (<ShadcnAlertDialogTrigger className={cn("w-full md:w-auto", className)} {...props} />);
}

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
