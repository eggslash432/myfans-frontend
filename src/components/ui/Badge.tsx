// front/src/components/ui/Badge.tsx
import type { BadgeTone } from "@/shared";
import * as React from "react";

type Props = {
  tone: BadgeTone;
  children: React.ReactNode;
  className?: string;
  title?: string;
};

const toneClass: Record<BadgeTone, string> = {
  success: "badge-success",
  warning: "badge-warning",
  danger: "badge-red", // 既存に合わせる
  info: "badge-info",
  muted: "badge-muted",
};

export function Badge({ tone, children, className, title }: Props) {
  const cls = ["badge", toneClass[tone], className]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={cls} title={title}>
      {children}
    </span>
  );
}
