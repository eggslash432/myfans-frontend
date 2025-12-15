// front/src/App.tsx
import { Routes, Route, Outlet } from "react-router-dom";
import Home from "./pages/home/Home";
import MyPage from "./pages/mypage/MyPage";
import CreatorPage from "./pages/creators/CreatorPage";
import PostDetail from "./pages/posts/PostDetail";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Success from "./pages/payments/Success";
import Cancel from "./pages/payments/Cancel";
import ProtectedRoute from "./components/ProtectedRoute";
import NewPost from "./pages/posts/NewPost";
import MyPlansPage from "./pages/plans/Plans";
import CreatorsAdminPage from "./pages/admin/AdminCreatorsPage";
import CreatorSettingsPage from "./pages/creators/settings";
import AdminPayoutsPage from "./pages/admin/AdminPayoutsPage";
import AdminPostsPage from "./pages/admin/AdminPostsPage";
import AppLayout from "./components/layout/AppLayout";
import AdminReportsPage from "./pages/admin/AdminReportsPage";
import AdminDashboard from "./pages/admin/Dashboard";
import CreatorPostsPage from "./pages/creators/CreatorPostsPage";
import CreatorPlansPage from "./pages/creators/CreatorPlansPage";
import PayoutsPage from "./pages/creators/CreatorPayoutsPage";
import CreatorAnalyticsPage from "./pages/creators/CreatorAnalyticsPage";
import CreatorProfilePage from "./pages/creators/CreatorProfilePage";
import PasswordChangePage from "./pages/settings/PasswordChangePage";
import SettingsHomePage from "./pages/settings";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";

export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* ✅ Admin 配下（/admin, /admin/creators ...） */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <Outlet />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="creators" element={<CreatorsAdminPage />} />
          <Route path="payouts" element={<AdminPayoutsPage />} />
          <Route path="posts" element={<AdminPostsPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>

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
            <ProtectedRoute roles={["creator", "admin"]}>
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

        <Route path="/creators/:id" element={<CreatorPage />} />

        <Route
          path="/mypage/plans"
          element={
            <ProtectedRoute>
              <MyPlansPage />
            </ProtectedRoute>
          }
        />

        <Route path="/payments/success" element={<Success />} />
        <Route path="/payments/cancel" element={<Cancel />} />

        {/* ✅ 設定配下もネストに統一 */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Outlet />
            </ProtectedRoute>
          }
        >
          <Route index element={<SettingsHomePage />} />
          <Route path="password" element={<PasswordChangePage />} />
        </Route>
      </Routes>
    </AppLayout>
  );
}
