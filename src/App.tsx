// front/src/App.tsx

import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import MyPage from './pages/mypage/MyPage';
import CreatorPage from './pages/creators/CreatorPage';
import PostDetail from './pages/posts/PostDetail';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Success from './pages/checkout/Success';
import Cancel from './pages/checkout/Cancel';
import ProtectedRoute from './components/ProtectedRoute';
import NewPost from './pages/posts/NewPost';
import MyPlansPage from './pages/Plans';
import CreatorsAdminPage from './pages/admin/AdminCreatorsPage';
import CreatorSettingsPage from './pages/creators/settings';
import AdminPayoutsPage from './pages/admin/AdminPayoutsPage';
import AdminPostsPage from './pages/admin/AdminPostsPage';
import AppLayout from './components/layout/AppLayout';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminDashboard from './pages/admin/Dashboard';
import CreatorPostsPage from './pages/creators/CreatorPostsPage';
import CreatorPlansPage from './pages/creators/CreatorPlansPage';
import PayoutsPage from './pages/creators/CreatorPayoutsPage';
import CreatorAnalyticsPage from './pages/creators/CreatorAnalyticsPage';
import CreatorProfilePage from './pages/creators/CreatorProfilePage';
import AdminSummaryPage from './pages/admin/AdminSummaryPage';
import PasswordChangePage from './pages/settings/PasswordChangePage';
import SettingsHomePage from './pages/settings';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

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
        <Route path="/admin/settings" element={<AdminSettingsPage />} />
        <Route path="/admin" element={<AdminSummaryPage />} />
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
          path="/posts/new"
          element={
            <ProtectedRoute roles= {['creator', 'admin']}>
              <NewPost />
            </ProtectedRoute>
          }
        />
        <Route path="/posts/:id" element={<PostDetail />} />
        {/* クリエイター用ページ */}
        <Route
          path="/creators/settings"
          element={
            <ProtectedRoute role="creator">
              <CreatorSettingsPage />
            </ProtectedRoute>
          }
        />        
        <Route
          path="/creator/posts"
          element={
            <ProtectedRoute role="creator">
              <CreatorPostsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/creator/plans"
          element={
            <ProtectedRoute role="creator">
              <CreatorPlansPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/creator/payouts"
          element={
            <ProtectedRoute role="creator">
              <PayoutsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/creator/analytics"
          element={
            <ProtectedRoute role="creator">
              <CreatorAnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/creator/profile"
          element={
            <ProtectedRoute role="creator">
              <CreatorProfilePage />
            </ProtectedRoute>
          }
        />        
        <Route 
          path="/creators/:id" 
          element={
            <CreatorPage />
          } 
        />

        <Route path="/mypage/plans" element={<MyPlansPage />} />
        <Route path="/checkout/success" element={<Success />} />
        <Route path="/checkout/cancel" element={<Cancel />} />

        {/* 設定 */}
        <Route path="/settings" element={<SettingsHomePage />} />
        <Route path="/settings/password" element={<PasswordChangePage />} />
      </Routes>        
    </AppLayout>
  );
}
