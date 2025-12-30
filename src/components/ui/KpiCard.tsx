// front/src/components/ui/KpiCard.tsx
import type { ReactNode } from "react";

type Props = {
  title: ReactNode;
  value: ReactNode;
  className?: string;
  valueClassName?: string;
  subtitleClassName?: string;
};

export function KpiCard({
  title,
  value,
  className = "",
  valueClassName = "",
  subtitleClassName = "",
}: Props) {
  return (
    <div className={`card ${className}`}>
      <div className={`section-subtitle ${subtitleClassName}`}>{title}</div>
      <div
        className={valueClassName}
        style={{ fontSize: "1.6rem", fontWeight: 800, marginTop: 6 }}
      >
        {value}
      </div>
    </div>
  );
}
