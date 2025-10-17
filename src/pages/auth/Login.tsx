import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'


export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { login } = useAuth()
  const nav = useNavigate()
  //const location = useLocation()
  //const from = (location.state as any)?.from || '/'
  const [_, setLoading] = useState(false);

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
    <div className="mx-auto max-w-md p-6">
      <h1 className="text-xl font-bold mb-4">ログイン</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full border p-2 rounded" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full border p-2 rounded" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="w-full py-2 border rounded">ログイン</button>
      </form>
    </div>
  )
}