// src/app.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { I18nProvider } from "@/contexts/I18nContext";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import ProtectedRoute from "./components/ProtectedRoute";
import Trends from "./pages/Trends";
import Content from "./pages/Content";
import Info from "./pages/Info";
import Agency from "./pages/Agency";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import NotFound from "./pages/NotFound";
import Chat from "./pages/Chat"; // <-- notre nouvelle page chat
import LessonDetail from "./pages/LessonDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <I18nProvider>
          <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />

            {/* App layout for authenticated & paid area */}
            <Route
              path="/*"
              element={
                <Layout>
                  <Routes>
                    {/* Agency accessible sans compte mais avec le Layout visible */}
                    <Route path="/agency" element={<Agency />} />
                    <Route
                      path="/trends"
                      element={
                        <ProtectedRoute>
                          <Trends />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/content"
                      element={
                        <ProtectedRoute>
                          <Content />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/info"
                      element={
                        <ProtectedRoute>
                          <Info />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    
                    <Route
                      path="/admin"
                      element={
                        <ProtectedRoute>
                          <Admin />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/settings"
                      element={
                        <ProtectedRoute>
                          <Settings />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/help"
                      element={
                        <ProtectedRoute>
                          <Help />
                        </ProtectedRoute>
                      }
                    />
                    {/* Nouvelle route pour le chat */}
                    <Route
                      path="/chat"
                      element={
                        <ProtectedRoute>
                          <Chat />
                        </ProtectedRoute>
                      }
                    />
                    {/* Route pour les détails d'une lesson */}
                    <Route
                      path="/lesson/:id"
                      element={
                        <ProtectedRoute>
                          <LessonDetail />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Layout>
              }
            />
            </Routes>
          </AuthProvider>
        </I18nProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
