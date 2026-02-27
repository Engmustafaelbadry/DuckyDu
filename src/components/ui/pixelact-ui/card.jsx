import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

import {
  Card as ShadcnCard,
  CardAction as ShadcnCardAction,
  CardContent as ShadcnCardContent,
  CardDescription as ShadcnCardDescription,
  CardFooter as ShadcnCardFooter,
  CardHeader as ShadcnCardHeader,
  CardTitle as ShadcnCardTitle,
} from "@/components/ui/card";

import "@/components/ui/pixelact-ui/styles/styles.css";

export const cardVariants = cva("", {
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

function Card({
  ...props
}) {
  const { className, font } = props;

  return (
    <ShadcnCard
      {...props}
      className={cn(
        "rounded-none border-0 bg-card shadow-(--pixel-box-shadow) box-shadow-margin",
        cardVariants({ font }),
        className
      )} />
  );
}

function CardHeader({
  ...props
}) {
  const { className } = props;

  return <ShadcnCardHeader className={cn("", className)} {...props} />;
}

function CardTitle({
  ...props
}) {
  const { className } = props;

  return (<ShadcnCardTitle className={cn("font-normal text-lg", className)} {...props} />);
}

function CardDescription({
  ...props
}) {
  const { className } = props;

  return <ShadcnCardDescription className={cn(className)} {...props} />;
}

function CardAction({
  ...props
}) {
  const { className } = props;

  return <ShadcnCardAction className={cn(className)} {...props} />;
}

function CardContent({
  ...props
}) {
  const { className } = props;

  return <ShadcnCardContent className={cn(className)} {...props} />;
}

function CardFooter({
  ...props
}) {
  const { className } = props;

  return (<ShadcnCardFooter data-slot="card-footer" className={cn(className)} {...props} />);
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
