import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing   from './pages/Landing';
import Login     from './pages/Login';
import Register  from './pages/Register';
import Setup     from './pages/Setup';
import Dashboard from './pages/Dashboard';
import MealPlan  from './pages/MealPlan';
import Routine   from './pages/Routine';
import Progress  from './pages/Progress';
import Navbar    from './components/Navbar';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:'flex',justifyContent:'center',marginTop:'4rem' }}><div className="spinner"/></div>;
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

function Layout({ children }) {
  const { user } = useAuth();
  return (
    <>
      {user && <Navbar />}
      {children}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          <Route path="/"          element={<PublicRoute><Landing /></PublicRoute>} />
          <Route path="/login"     element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register"  element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/setup"     element={<PrivateRoute><Setup /></PrivateRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/alimentacion" element={<PrivateRoute><MealPlan /></PrivateRoute>} />
          <Route path="/ejercicio" element={<PrivateRoute><Routine /></PrivateRoute>} />
          <Route path="/progreso"  element={<PrivateRoute><Progress /></PrivateRoute>} />
          <Route path="*"          element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </AuthProvider>
  );
}
