// front/src/components/RangeButton.tsx

type Props<T> = {
  label: string;
  value: T;
  current: T;
  onClick: (v: T) => void;
  className?: string;
};

export function RangeButton<T>({
  label,
  value,
  current,
  onClick,
  className = "",
}: Props<T>) {
  const active = value === current;

  return (
    <button
      type="button"
      className={`btn ${className}`}
      onClick={() => onClick(value)}
      style={{
        fontWeight: 700,
        opacity: active ? 1 : 0.6,
        borderColor: active ? "#94a3b8" : undefined,
      }}
    >
      {label}
    </button>
  );
}
