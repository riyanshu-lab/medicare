import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider }          from './context/DataContext';
import { ToastProvider }         from './context/ToastContext';
import { NotificationProvider }  from './context/NotificationContext';
import Navbar   from './components/layout/Navbar';
import Footer   from './components/layout/Footer';
import Home           from './pages/Home';
import Auth            from './pages/Auth';
import Doctors        from './pages/Doctors';
import Departments    from './pages/Departments';
import Booking        from './pages/Booking';
import PatientDashboard from './pages/PatientDashboard';
import AdminDashboard   from './pages/AdminDashboard';
import Contact        from './pages/Contact';
import './styles/global.css';

/* ─── Protected Route ─────────────────────────────────────────────────────── */
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh' }}>
      <span className="spinner" style={{ width:36, height:36, borderWidth:3 }} />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

/* ─── Layout (with Navbar & Footer) ──────────────────────────────────────── */
const Layout = ({ children, hideFooter = false }) => (
  <>
    <a href="#main-content" className="skip-link">Skip to main content</a>
    <Navbar />
    <div id="main-content">{children}</div>
    {!hideFooter && <Footer />}
  </>
);

/* ─── App ─────────────────────────────────────────────────────────────────── */
const AppRoutes = () => (
  <Routes>
    <Route path="/"            element={<Layout><Home /></Layout>} />
    <Route path="/doctors"     element={<Layout><Doctors /></Layout>} />
    <Route path="/departments" element={<Layout><Departments /></Layout>} />
    <Route path="/contact"     element={<Layout><Contact /></Layout>} />
    <Route path="/login"       element={<Layout hideFooter><Auth /></Layout>} />
    <Route path="/register"    element={<Layout hideFooter><Auth /></Layout>} />

    <Route path="/booking" element={
      <Layout>
        <ProtectedRoute>
          <Booking />
        </ProtectedRoute>
      </Layout>
    } />

    <Route path="/dashboard/*" element={
      <ProtectedRoute>
        <Layout hideFooter>
          <PatientDashboard />
        </Layout>
      </ProtectedRoute>
    } />

    <Route path="/admin/*" element={
      <ProtectedRoute adminOnly>
        <Layout hideFooter>
          <AdminDashboard />
        </Layout>
      </ProtectedRoute>
    } />

    {/* 404 */}
    <Route path="*" element={
      <Layout>
        <div style={{ textAlign:'center', padding:'var(--space-24) var(--space-4)' }}>
          <div style={{ fontSize:'5rem', marginBottom:'var(--space-4)' }}>🏥</div>
          <h1 style={{ fontSize:'3rem', color:'var(--color-gray-300)', marginBottom:'var(--space-4)' }}>404</h1>
          <h2>Page Not Found</h2>
          <p style={{ marginBottom:'var(--space-8)' }}>The page you're looking for doesn't exist or has been moved.</p>
          <a href="/" className="btn btn-primary btn-lg">← Back to Home</a>
        </div>
      </Layout>
    } />
  </Routes>
);

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <DataProvider>
        <ToastProvider>
          <NotificationProvider>
            <AppRoutes />
          </NotificationProvider>
        </ToastProvider>
      </DataProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
