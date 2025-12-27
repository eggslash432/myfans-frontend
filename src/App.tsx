// front/src/App.tsx
import { Routes, Route, Outlet } from "react-router-dom";
import Home from "./pages/home/HomePage";
import { MyPage } from "@/pages/mypage/MyPage";
import CreatorPage from "./pages/creators/CreatorPage";
import { PostDetailPage } from "@/pages/posts/PostDetailPage";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Success from "./pages/payments/Success";
import Cancel from "./pages/payments/Cancel";
import { 
  ProtectedRoute,
  AppLayout, 
} from "@/components";
import { NewPostPage } from "@/pages/posts/NewPostPage";
import MyPlansPage from "./pages/plans/Plans";
import CreatorsAdminPage from "./pages/admin/AdminCreatorsPage";
import CreatorSettingsPage from "./pages/creators/settings";
import AdminPayoutsPage from "./pages/admin/AdminPayoutsPage";
import AdminPostsPage from "./pages/admin/AdminPostsPage";
import AdminReportsPage from "./pages/admin/AdminReportsPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CreatorPostsPage from "./pages/creators/CreatorPostsPage";
import CreatorPlansPage from "./pages/creators/CreatorPlansPage";
import PayoutsPage from "./pages/creators/CreatorPayoutsPage";
import CreatorAnalyticsPage from "./pages/creators/CreatorAnalyticsPage";
import CreatorProfilePage from "./pages/creators/CreatorProfilePage";
import PasswordChangePage from "./pages/settings/PasswordChangePage";
import SettingsHomePage from "./pages/settings";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import ShopDashboardPage from "./pages/shops/ShopDashboardPage";
import ShopCreatorApplicationsPage from "./pages/shops/ShopCreatorApplicationsPage";
import ShopSalesPage from "./pages/shops/ShopSalesPage";
import GenresPage from "./pages/genres/GenresPage";
import { GenreDetailPage } from "./pages/home/GenreListPage";
import ShopMembershipPage from "./pages/shops/ShopMembershipPage";
import CreatorOrAdminRoute from "./CreatorOrAdminRoute";
import AdminShopMembersPage from "./pages/admin/AdminShopMembersPage";
import AdminShopCreatePage from "./pages/admin/AdminShopCreatePage";
import AdminSummaryPage from "./pages/admin/AdminSummaryPage";
import AdminNotificationsPage from "./pages/admin/AdminNotificationsPage";
import AdminAnnouncementsPage from "./pages/admin/announcements/AdminAnnouncementsPage";
import CampaignPage from "./pages/home/CampaignPage";

export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/campaign" element={<CampaignPage />} />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* ✅ Admin 配下（/admin, /admin/creators ...） */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute require="admin">
              <Outlet />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="creators" element={<CreatorsAdminPage />} />
          <Route path="payouts" element={<AdminPayoutsPage />} />
          <Route path="summary" element={<AdminSummaryPage/>}/>
          <Route path="posts" element={<AdminPostsPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
          <Route path="announcements" element={<AdminAnnouncementsPage/>}/>
          <Route path="notifications" element={<AdminNotificationsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="shops/members" element={<AdminShopMembersPage />} />
          <Route path="shops/create" element={<AdminShopCreatePage />} />
        </Route>

        {/* ✅ Shops 配下（/shops, /shops/...） */}
        <Route
          path="/shops"
          element={
            <ProtectedRoute require="shop">
              <Outlet />
            </ProtectedRoute>
          }
        >
          <Route index element={<ShopDashboardPage />} />
          <Route path="creator-applications" element={<ShopCreatorApplicationsPage />} />
          <Route path="sales" element={<ShopSalesPage />} />
          <Route path="membership" element={<ShopMembershipPage />} />
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
            <CreatorOrAdminRoute>
              <NewPostPage />
            </CreatorOrAdminRoute>
          }
        />

        <Route path="/posts/:id" element={<PostDetailPage />} />

        <Route path="/genres" element={<GenresPage />} />
        <Route path="/genres/:genreId" element={<GenreDetailPage />} />        

        {/* クリエイター用ページ */}
        <Route
          path="/creators/settings"
          element={
            <ProtectedRoute require="auth">
              <CreatorSettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/creators/posts"
          element={
            <ProtectedRoute require="auth">
              <CreatorPostsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/creators/plans"
          element={
            <ProtectedRoute require="auth">
              <CreatorPlansPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/creators/payouts"
          element={
            <ProtectedRoute require="auth">
              <PayoutsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/creators/analytics"
          element={
            <ProtectedRoute require="auth">
              <CreatorAnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/creators/profile"
          element={
            <ProtectedRoute require="auth">
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
