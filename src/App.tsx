import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Home from './pages/Home';
import MyPage from './pages/MyPage';
import CreatorPage from './pages/creators/[id]';
import PostDetailPage from './pages/posts/[id]';
import TestMidreview from './pages/TestMidreview';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Success from './pages/checkout/Success';
import Cancel from './pages/checkout/Cancel';
import ProtectedRoute from './components/ProtectedRoute';
import NewPost from './pages/posts/NewPost';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
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
          <Route path="/test" element={<TestMidreview />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>  
  );
}
