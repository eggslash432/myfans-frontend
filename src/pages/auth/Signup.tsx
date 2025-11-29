// front/src/pages/auth/Signup.tsx

import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import PasswordField from '../../components/PasswordField';

export default function Signup() {
  const { signup } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    try {
      await signup(email, password);  // ← role は渡さない
      nav('/');                       // ログイン済みトップへ
    } catch (e: any) {
      setErr(e.message || 'サインアップ失敗');
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">サインアップ</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="border rounded w-full p-2"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="email"
          required
        />

        {/* PasswordField（長押しで表示） */}
        <PasswordField
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          minLength={8}
          required
          className=""
          label="パスワード"
        />

        {err && <div className="text-red-700 text-sm">{err}</div>}

        <button className="px-4 py-2 bg-black text-white rounded w-full">
          登録
        </button>

        <div className="text-xs text-gray-500 mt-2 text-right">
          すでにアカウントをお持ちの方は{' '}
          <Link to="/login" className="underline">
            ログイン
          </Link>
        </div>
      </form>
    </div>
  );
}
