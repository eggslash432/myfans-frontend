// front/src/App.tsx
import { Routes, Route, Outlet } from "react-router-dom";
import { 
  ProtectedRoute,
  AppLayout, 
} from "@/components";
import CreatorOrAdminRoute from "./CreatorOrAdminRoute";
import { 
  CampaignPage, 
  Login, 
  Signup, 
  AdminDashboard,
  AdminNotificationsPage,
  AdminPayoutsPage, 
  AdminSummaryPage, 
  AdminPostsPage, 
  AdminReportsPage, 
  AdminAnnouncementsPage, 
  AdminSettingsPage, 
  AdminShopMembersPage, 
  AdminShopCreatePage, 
  ShopDashboardPage, 
  ShopCreatorApplicationsPage, 
  ShopSalesPage, 
  ShopMembershipPage, 
  MyPage,
  NewPostPage, 
  PostDetailPage, 
  GenresPage, 
  GenreDetailPage, 
  CreatorSettingsPage, 
  CreatorPostsPage, 
  CreatorPlansPage, 
  CreatorAnalyticsPage, 
  CreatorProfilePage, 
  CreatorPage, 
  Success, 
  Cancel, 
  SettingsHomePage, 
  PasswordChangePage, 
  AdminCreatorsPage,
  CreatorPayoutsPage,
  Plans,
  HomePage
} from "./pages";


export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
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
          <Route path="creators" element={<AdminCreatorsPage />} />
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
              <CreatorPayoutsPage />
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
              <Plans />
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
