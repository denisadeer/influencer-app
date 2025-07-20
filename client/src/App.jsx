import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Landing from "./pages/LandingPage";
import Register from "./pages/Register";
import Terms from "./pages/Terms";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import InfluencerDashboard from "./components/InfluencerDashboard";
import InfluencerList from "./components/InfluencerList";
import InfluencerDetail from "./components/InfluencerDetail";
import SubscriptionPage from "./pages/SubscriptionPage";
import EmailVerified from "./pages/EmailVerified";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUserProfile from "./pages/AdminUserProfile";
import PlatbaUspesna from "./pages/PlatbaUspesna";
import PlatbaZrusena from "./pages/PlatbaZrusena";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Unauthorized from "./pages/Unauthorized"; // 🆕 přidáno
import ProtectedRoute from "./routes/ProtectedRoute"; // 🆕 přidáno
import ChatPage from "./pages/ChatPage"; // nahoře s ostatními importy
import VerifyEmail from "./pages/VerifyEmail"; // nebo správná cesta podle struktury

function App() {
  return (
    <Router>
      <nav>
        <Link to="/">Domů</Link> |{" "}
        <Link to="/register">Registrace</Link> |{" "}
        <Link to="/login">Přihlášení</Link> |{" "}
        <Link to="/dashboard">Dashboard</Link> |{" "}
        <Link to="/predplatne">Předplatné</Link> |{" "}
      </nav>

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/test-influencer" element={<InfluencerDashboard />} />
        <Route path="/influencers" element={<InfluencerList />} />
        <Route path="/influencer/:id" element={<InfluencerDetail />} />
        <Route path="/predplatne" element={<SubscriptionPage />} />
        <Route path="/email-verified" element={<EmailVerified />} />
        <Route path="/chat/:influencerId" element={<ChatPage />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* 🔐 Chráněné routy jen pro adminy */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/user/:userId"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminUserProfile />
            </ProtectedRoute>
          }
        />

        <Route path="/platba-uspesna" element={<PlatbaUspesna />} />
        <Route path="/platba-zrusena" element={<PlatbaZrusena />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* 🛑 Stránka pro nepovolený přístup */}
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </Router>
  );
}

export default App;
