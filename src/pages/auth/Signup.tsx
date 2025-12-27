// front/src/pages/auth/Signup.tsx

import { useState } from 'react';
import { useAuth } from '@/hooks';
import { useNavigate, Link } from 'react-router-dom';
import { PasswordField } from '@/components';

export default function Signup() {
  const { signup } = useAuth();
  const nav = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');

    try {
      setLoading(true);
      await signup(email, password);      // ← 役割は今まで通り
      nav('/');                           // ログイン済みトップへ
    } catch (e: any) {
      setErr(e.message || 'サインアップ失敗');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-auth">
      <div className="auth-card">
        <h1 className="page-title">サインアップ</h1>
        <p className="page-description">
          メールアドレスとパスワードを入力して、新規登録を行ってください。
        </p>

        {err && <div className="auth-error">{err}</div>}

        <form onSubmit={onSubmit} className="auth-form">
          {/* メールアドレス */}
          <div className="form-field">
            <label className="form-label" htmlFor="email">
              email
            </label>
            <input
              id="email"
              className="form-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          {/* パスワード（PasswordFieldをそのまま利用） */}
          <div className="form-field">
            <PasswordField
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
              className="form-input"
              label="パスワード"
            />
          </div>

          <button
            type="submit"
            className="btn-primary mt-2"
            disabled={loading}
          >
            {loading ? '登録中…' : '登録'}
          </button>
        </form>

        <div className="auth-sub-links">
          <span>すでにアカウントをお持ちの方は</span>
          <Link to="/login" className="auth-link">
            ログイン
          </Link>
        </div>
      </div>
    </div>
  );
}
