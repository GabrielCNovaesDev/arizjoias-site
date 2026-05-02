import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "elevated";
}

export function Card({ children, className = "", variant = "default" }: CardProps) {
  const base =
    variant === "elevated"
      ? "shadow-md"
      : "border"
  ;

  return (
    <div
      className={`p-6 ${base} ${className}`}
      style={
        variant === "default"
          ? { backgroundColor: "var(--cream-light)", borderColor: "var(--cream-dark)" }
          : { backgroundColor: "var(--warm-white)" }
      }
    >
      {children}
    </div>
  );
}
