import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Header() {
  const { user, logout } = useAuth()
  const nav = useNavigate()
  return (
    <header className="border-b">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center gap-4">
        <Link to="/" className="font-bold text-lg">MyFans Clone</Link>
        <nav className="ml-auto flex items-center gap-3">
          <Link to="/" className="hover:underline">Home</Link>
          {user ? (
            <>
              <Link to="/mypage" className="hover:underline">MyPage</Link>
              {user.role === 'admin' && <Link to="/admin" className="hover:underline">Admin</Link>}
              <button onClick={() => { logout(); nav('/'); }} className="px-3 py-1 border rounded">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:underline">Login</Link>
              <Link to="/signup" className="hover:underline">Signup</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}