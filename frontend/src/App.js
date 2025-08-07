import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { socketService } from './services/socketService';

// Layout components
import Layout from './components/layout/Layout';
import LoadingSpinner from './components/ui/LoadingSpinner';

// Page components
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import CampaignsPage from './pages/CampaignsPage';
import CampaignDetailPage from './pages/CampaignDetailPage';
import CampaignChatPage from './pages/CampaignChatPage';
import CharactersPage from './pages/CharactersPage';
import CharacterDetailPage from './pages/CharacterDetailPage';
import ProfilePage from './pages/ProfilePage';
import DiceRollerPage from './pages/DiceRollerPage';
import FirebaseDemo from './components/FirebaseDemo';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Public Route component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

// Socket connection manager
const SocketManager = () => {
  const { isAuthenticated, token } = useAuth();

  useEffect(() => {
    if (isAuthenticated && token) {
      socketService.connect(token);
    } else {
      socketService.disconnect();
    }

    return () => {
      socketService.disconnect();
    };
  }, [isAuthenticated, token]);

  return null;
};

function App() {
  return (
    <div className="App min-h-screen bg-gray-50 dark:bg-gray-900">
      <AuthProvider>
        <Router>
          <SocketManager />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              } 
            />
            <Route 
              path="/firebase-demo" 
              element={<FirebaseDemo />} 
            />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/campaigns"
              element={
                <ProtectedRoute>
                  <Layout>
                    <CampaignsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/campaigns/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <CampaignDetailPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/campaigns/:id/chat"
              element={
                <ProtectedRoute>
                  <CampaignChatPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/characters"
              element={
                <ProtectedRoute>
                  <Layout>
                    <CharactersPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/characters/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <CharacterDetailPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dice"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DiceRollerPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ProfilePage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>

          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--toast-bg)',
                color: 'var(--toast-color)',
                border: '1px solid var(--toast-border)',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#ffffff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#ffffff',
                },
              },
            }}
          />
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;
