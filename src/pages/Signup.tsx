import { FormEvent, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'


export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { signup } = useAuth()
  const nav = useNavigate()


  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await signup(email, password)
      nav('/mypage')
    } catch (err: any) {
      setError(err?.response?.data?.message ?? '登録に失敗しました')
    }
  }


  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="text-xl font-bold mb-4">新規登録</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full border p-2 rounded" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full border p-2 rounded" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="w-full py-2 border rounded">登録</button>
      </form>
    </div>
  )
}