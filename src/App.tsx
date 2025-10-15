// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './hooks/useAuth';

import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MyPage from './pages/MyPage';
import AdminDashboard from './pages/admin/Dashboard';

import CreatorPage from './pages/creators/[id]';
import PostDetailPage from './pages/posts/[id]';

function NotFound() { return <main style={{padding:16}}>404 Not Found</main>; }

const qc = new QueryClient();

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
            <Route path="/creator/:id" element={<Navigate to="/creators/:id" replace />} />
            <Route path="/creators/:id" element={<CreatorPage />} />
            <Route path="/posts/:id" element={<PostDetailPage />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
