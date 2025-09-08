import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import ResponsiveContainer from './components/ResponsiveContainer';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import QRGenerator from './pages/QRGenerator';
import QRLibrary from './pages/QRLibrary';
import Analytics from './pages/Analytics';
import ApiKeys from './pages/ApiKeys';
import ApiDocs from './pages/ApiDocs';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
};

// Public Route Component (redirect to dashboard if logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return user ? <Navigate to="/dashboard" /> : children;
};

function AppContent() {
  const { user } = useAuth();

  return (
    <ResponsiveContainer className="min-h-screen bg-gray-50">
      {user && <Navbar />}
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/generate" element={
          <ProtectedRoute>
            <QRGenerator />
          </ProtectedRoute>
        } />
        <Route path="/library" element={
          <ProtectedRoute>
            <QRLibrary />
          </ProtectedRoute>
        } />
        <Route path="/analytics" element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        } />
        <Route path="/api-keys" element={
          <ProtectedRoute>
            <ApiKeys />
          </ProtectedRoute>
        } />
        <Route path="/docs" element={
          <ProtectedRoute>
            <ApiDocs />
          </ProtectedRoute>
        } />
        
        {/* Default redirect */}
        <Route path="/" element={
          user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
        } />
      </Routes>
      <Toaster position="top-right" />
    </ResponsiveContainer>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;