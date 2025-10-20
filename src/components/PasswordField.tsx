// components/PasswordField.tsx
import { useState, useRef } from "react";

type Props = {
  id?: string;
  name?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  minLength?: number;
  required?: boolean;
  autoComplete?: string; // "new-password" | "current-password" など
  className?: string;
  label?: string;
};

export default function PasswordField({
  id = "password",
  name = "password",
  value,
  onChange,
  placeholder = "パスワード",
  minLength = 8,
  required = true,
  autoComplete = "new-password",
  className = "",
  label = "パスワード",
}: Props) {
  const [revealed, setRevealed] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  const show = () => setRevealed(true);
  const hide = () => setRevealed(false);

  return (
    <div className={`w-full ${className}`}>
      <label htmlFor={id} className="block mb-1 text-sm text-gray-700">
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          name={name}
          type={revealed ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          minLength={minLength}
          required={required}
          autoComplete={autoComplete}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        {/* 目アイコンボタン（長押しで表示 / 離したら非表示） */}
        <button
          ref={btnRef}
          type="button"
          onMouseDown={(e) => {
            e.preventDefault(); // フォーカス移動を防ぐ
            show();
          }}
          onMouseUp={hide}
          onMouseLeave={hide}
          onTouchStart={(e) => {
            e.preventDefault();
            show();
          }}
          onTouchEnd={hide}
          onBlur={hide}
          aria-label={revealed ? "パスワードを隠す" : "パスワードを表示"}
          title="長押しで表示"
          className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-500 hover:text-gray-700"
        >
          {/* アイコンはSVGで依存なし。revealedで切替 */}
          {revealed ? (
            // eye-off
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3l18 18" />
              <path d="M10.58 10.58A2 2 0 0012 14a2 2 0 001.42-.58M9.88 4.24A10.94 10.94 0 0121 12a11.05 11.05 0 01-2.17 3.17" />
              <path d="M6.12 6.12A11.05 11.05 0 003 12a10.94 10.94 0 0011.12 7.76" />
            </svg>
          ) : (
            // eye
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>

      <p className="mt-1 text-xs text-gray-500">
        目のボタンを<strong>長押し</strong>している間だけ表示されます。
      </p>
    </div>
  );
}
