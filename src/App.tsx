// front/src/App.tsx

import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import MyPage from './pages/MyPage';
import CreatorPage from './pages/creators/[id]';
import PostDetailPage from './pages/posts/[id]';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Success from './pages/checkout/Success';
import Cancel from './pages/checkout/Cancel';
import ProtectedRoute from './components/ProtectedRoute';
import NewPost from './pages/posts/NewPost';
import MyPlansPage from './pages/Plans';
import CreatorsAdminPage from './pages/admin/CreatorsAdminPage';
import CreatorSettingsPage from './pages/creators/settings';
import PayoutsPage from './pages/creators/PayoutsPage';
import AdminPayoutsPage from './pages/admin/AdminPayoutsPage';
import AdminPostsPage from './pages/admin/AdminPostsPage';
import AppLayout from './components/layout/AppLayout';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminDashboard from './pages/admin/Dashboard';

export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Admin トップ（ダッシュボード） */}
        <Route path="/admin" element={<AdminDashboard />} />    
        {/* 個別 Admin ページ */}        
        <Route path="/admin/creators" element={<CreatorsAdminPage />} />
        <Route path="/admin/payouts" element={<AdminPayoutsPage />} />
        <Route path="/admin/posts" element={<AdminPostsPage />} />
        <Route path="/admin/reports" element={<AdminReportsPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/mypage"
          element={
            <ProtectedRoute>
              <MyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/creators/settings"
          element={
            <ProtectedRoute role="creator">
              <CreatorSettingsPage />
            </ProtectedRoute>
          }
        />
        <Route path="/creators/payouts" element={<PayoutsPage />} />
        <Route path="/mypage/plans" element={<MyPlansPage />} />
        <Route path="/creators/:id" element={<CreatorPage />} />
        <Route
          path="/posts/new"
          element={
            <ProtectedRoute role="creator">
              <NewPost />
            </ProtectedRoute>
          }
        />
        <Route path="/posts/:id" element={<PostDetailPage />} />
        <Route path="/checkout/success" element={<Success />} />
        <Route path="/checkout/cancel" element={<Cancel />} />
      </Routes>        
    </AppLayout>
  );
}
