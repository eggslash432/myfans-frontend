// front/src/components/PasswordField.tsx
import { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

type Props = {
  label?: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  autoComplete?: string;
  minLength?: number;
  required?: boolean;
  className?: string;
  inputClassName?: string;
};

export default function PasswordField({
  label = 'パスワード',
  value,
  onChange,
  autoComplete,
  minLength,
  required,
  className = '',
  inputClassName = '',
}: Props) {
  const [show, setShow] = useState(false);

  const handleToggle = () => {
    setShow((prev) => !prev);
  };

  return (
    <div className={`form-password ${className}`}>
      {label && <label className="form-label">{label}</label>}

      <div className="password-input-wrapper">
        <input
          type={show ? 'text' : 'password'}
          className={`form-input ${inputClassName}`}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          minLength={minLength}
          required={required}
        />

        <button
          type="button"
          className="password-toggle"
          onClick={handleToggle}
          aria-label={show ? 'パスワードを隠す' : 'パスワードを表示'}
        >
          {show ? (
            <EyeSlashIcon className="password-icon" />
          ) : (
            <EyeIcon className="password-icon" />
          )}
        </button>
      </div>

      <p className="form-hint">
        目のボタンをタップすると表示／非表示を切り替えられます。
      </p>
    </div>
  );
}
