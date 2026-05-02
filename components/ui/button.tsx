import Link from "next/link";
import type { ReactNode } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "gold" | "ghost";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

interface LinkButtonProps {
  variant?: "primary" | "outline" | "gold" | "ghost";
  size?: "sm" | "md" | "lg";
  href: string;
  children: ReactNode;
  className?: string;
}

const variantClass: Record<string, string> = {
  primary: "btn-primary",
  outline: "btn-outline",
  gold: "btn-gold",
  ghost:
    "font-body text-xs tracking-[0.12em] uppercase py-3.5 px-8 border inline-flex items-center gap-2 transition-all duration-300 hover:bg-white/10",
};

export function Button({
  variant = "primary",
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button className={`${variantClass[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function LinkButton({
  variant = "primary",
  href,
  children,
  className = "",
}: LinkButtonProps) {
  return (
    <Link href={href} className={`${variantClass[variant]} ${className}`}>
      {children}
    </Link>
  );
}
