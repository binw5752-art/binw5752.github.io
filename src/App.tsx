import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/store/auth";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HalftoneBg from "@/components/layout/HalftoneBg";
import RequireAuth from "@/components/auth/RequireAuth";
import Home from "@/pages/Home";
import AuthPage from "@/pages/Auth";
import Projects from "@/pages/Projects";
import Studio from "@/pages/Studio";
import Settings from "@/pages/Settings";
import Library from "@/pages/Library";
import WorkDetail from "@/pages/WorkDetail";
import Pricing from "@/pages/Pricing";
import NotFound from "@/pages/NotFound";

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <HalftoneBg />
        <Navbar />
        <main className="relative z-10 min-h-screen pt-16 md:pt-20">
          <Routes>
            <Route path="/" element={<Home />} />

            {/* 认证 */}
            <Route path="/login" element={<AuthPage mode="login" />} />
            <Route path="/register" element={<AuthPage mode="register" />} />

            {/* 项目列表（需登录） */}
            <Route
              path="/projects"
              element={
                <RequireAuth>
                  <Projects />
                </RequireAuth>
              }
            />

            {/* 项目内工作台（需登录） */}
            <Route
              path="/projects/:id/studio"
              element={
                <RequireAuth>
                  <Studio />
                </RequireAuth>
              }
            />

            {/* 兼容旧路由 /studio 跳到 /projects */}
            <Route path="/studio" element={<Navigate to="/projects" replace />} />

            {/* 设置（API 接入，需登录） */}
            <Route
              path="/settings"
              element={
                <RequireAuth>
                  <Settings />
                </RequireAuth>
              }
            />

            <Route path="/library" element={<Library />} />
            <Route path="/work/:id" element={<WorkDetail />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </AuthProvider>
    </Router>
  );
}
