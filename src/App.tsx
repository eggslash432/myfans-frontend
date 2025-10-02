import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Header from './components/Header'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Creator from './pages/Creator'
import Plans from './pages/Plans'
import PostDetail from './pages/PostDetail'
import MyPage from './pages/MyPage'
import AdminDashboard from './pages/admin/Dashboard'
import { AuthProvider } from './hooks/useAuth'


const qc = new QueryClient()


export default function App() {
return (
<QueryClientProvider client={qc}>
<AuthProvider>
<BrowserRouter>
<Header />
<Routes>
<Route path="/" element={<Home />} />
<Route path="/login" element={<Login />} />
<Route path="/signup" element={<Signup />} />
<Route path="/creator/:id" element={<Creator />} />
<Route path="/creator/:id/plans" element={<Plans />} />
<Route path="/posts/:id" element={<PostDetail />} />
<Route path="/mypage" element={<MyPage />} />
<Route path="/admin" element={<AdminDashboard />} />
</Routes>
</BrowserRouter>
</AuthProvider>
</QueryClientProvider>
)
}