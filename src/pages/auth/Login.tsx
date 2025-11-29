// front/src/pages/auth/Login.tsx

import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { Link, useNavigate } from 'react-router-dom'
import PasswordField from '../../components/PasswordField'


export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      nav('/');
    } catch (e:any) {
      setError(e.message || 'ログイン失敗');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="page page-auth">
      <div className="auth-card">
        <h1 className="page-title text-center">ログイン</h1>
        <p className="page-description text-center mb-4">
          メールアドレスとパスワードを入力してください。
        </p>

        {error && (
          <div className="auth-error">{error}</div>
        )}

        <form onSubmit={onSubmit} className="auth-form">
          <div className="form-field">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="creator1@example.com"
              required
            />
          </div>

          <div className="form-field">
            <PasswordField
              label="パスワード"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              minLength={8}
              required
              className="form-input"
            />
          </div>

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? 'ログイン中…' : 'ログイン'}
          </button>
        </form>

        <div className="auth-sub-links">
          <span>アカウントをお持ちでない方</span>
          <Link to="/signup" className="auth-link">
            新規登録
          </Link>
        </div>
      </div>
    </div>
  );
}