import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Dashboard from "./pages/Dashboard";
import CreateSheet from "./pages/CreateSheet";
import ExamPage from "./pages/ExamPage";
import ResultPage from "./pages/ResultPage";
import SheetsPage from "./pages/SheetsPage";
import HistoryPage from "./pages/HistoryPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import ChatPage from "./pages/ChatPage";
import LandingPage from "./pages/LandingPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import OAuthConsentPage from "./pages/OAuthConsentPage";
import MaterialsPage from "./pages/MaterialsPage";
import MaterialDetailPage from "./pages/MaterialDetailPage";
import LibraryPage from "./pages/LibraryPage";
import ReferPage from "./pages/ReferPage";
import AdminPage from "./pages/AdminPage";
import { useEffect } from "react";
import { captureReferralFromUrl } from "./lib/referral";
import { ReferralPromoBanner } from "./components/ReferralPromoBanner";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-muted-foreground">Loading...</div></div>;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-muted-foreground">Loading...</div></div>;
  if (user) {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get('next');
    const target = raw && raw.startsWith('/') && !raw.startsWith('//') ? raw : '/app';
    return <Navigate to={target} replace />;
  }
  return <>{children}</>;
}

function HomeRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-muted-foreground">Loading...</div></div>;
  return user ? <Dashboard /> : <LandingPage />;
}

const AppRoutes = () => (
  <Routes>
    <Route path="/auth" element={<AuthRoute><AuthPage /></AuthRoute>} />
    <Route path="/reset-password" element={<ResetPasswordPage />} />
    <Route path="/" element={<HomeRoute />} />
    <Route path="/app" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="/create" element={<ProtectedRoute><CreateSheet /></ProtectedRoute>} />
    <Route path="/exam/:id" element={<ProtectedRoute><ExamPage /></ProtectedRoute>} />
    <Route path="/result/:attemptId" element={<ProtectedRoute><ResultPage /></ProtectedRoute>} />
    <Route path="/sheets" element={<ProtectedRoute><SheetsPage /></ProtectedRoute>} />
    <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
    <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
    <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
    <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
    <Route path="/leaderboard" element={<LeaderboardPage />} />
    <Route path="/materials" element={<MaterialsPage />} />
    <Route path="/materials/:id" element={<MaterialDetailPage />} />
    <Route path="/library" element={<ProtectedRoute><LibraryPage /></ProtectedRoute>} />
    <Route path="/refer" element={<ProtectedRoute><ReferPage /></ProtectedRoute>} />
    <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
    <Route path="/.lovable/oauth/consent" element={<OAuthConsentPage />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

function ReferralCapture() {
  useEffect(() => { captureReferralFromUrl(); }, []);
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ReferralCapture />
            <ReferralPromoBanner />
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
