import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/common/ProtectedRoute';
import './styles/App.css';

const RedirectBasedOnAuth = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>; 

  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route 
              path="/" 
              element={
                <RedirectBasedOnAuth>
                  <Navigate to="/dashboard" replace />
                </RedirectBasedOnAuth>
              } 
            />

            <Route 
              path="/login" 
              element={
                <LoginRedirect>
                  <Login />
                </LoginRedirect>
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
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

const LoginRedirect = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return user ? <Navigate to="/dashboard" replace /> : children;
};

export default App;
