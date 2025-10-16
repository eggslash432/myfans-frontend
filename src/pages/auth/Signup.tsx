import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  const { signup } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('user1@example.com');
  const [password, setPassword] = useState('pass1234');
  const [role, setRole] = useState<'fan'|'creator'>('fan');
  const [err, setErr] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    try {
      await signup(email, password, role);
      nav('/');
    } catch (e:any) { setErr(e.message || 'サインアップ失敗'); }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">サインアップ</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="border rounded w-full p-2" value={email} onChange={e=>setEmail(e.target.value)} placeholder="email" />
        <input className="border rounded w-full p-2" value={password} onChange={e=>setPassword(e.target.value)} placeholder="password" type="password" />
        <div className="flex items-center gap-3 text-sm">
          <label className="flex items-center gap-1"><input type="radio" checked={role==='fan'} onChange={()=>setRole('fan')} />ファン</label>
          <label className="flex items-center gap-1"><input type="radio" checked={role==='creator'} onChange={()=>setRole('creator')} />クリエイター</label>
        </div>
        {err && <div className="text-red-700 text-sm">{err}</div>}
        <button className="px-4 py-2 bg-black text-white rounded">登録</button>
      </form>
    </div>
  );
}
