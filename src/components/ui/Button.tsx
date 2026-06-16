import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "accent" | "ghost";
type Size = "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-primary text-dark font-bold hover:bg-primary-hover",
  secondary:
    "border border-primary text-content hover:bg-dark-lighter",
  accent: "bg-primary text-dark font-bold hover:bg-primary-hover",
  ghost: "border border-border-input text-content hover:bg-dark-lighter",
};

const SIZES: Record<Size, string> = {
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-base",
};

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-md font-semibold no-underline transition-colors duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

type AsButton = CommonProps & ComponentProps<"button"> & { href?: undefined };
type AsLink = CommonProps & { href: string } & Omit<ComponentProps<typeof Link>, "href">;

export default function Button(props: AsButton | AsLink) {
  const { variant = "primary", size = "md", className, children, ...rest } = props;
  const classes = cn(BASE, VARIANTS[variant], SIZES[size], className);

  if ("href" in rest && rest.href !== undefined) {
    const { href, ...linkRest } = rest;
    return (
      <Link href={href} className={classes} {...linkRest}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(rest as ComponentProps<"button">)}>
      {children}
    </button>
  );
}
