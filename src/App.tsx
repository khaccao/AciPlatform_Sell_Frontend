import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

// Component to handle extracting token from URL (when embedded in Iframe)
function TokenCatcher({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenFromUrl = params.get('token');
    
    if (tokenFromUrl) {
      localStorage.setItem('sell_token', tokenFromUrl);
      // Clean up URL to avoid leaving token exposed
      navigate('/', { replace: true });
    }
    setIsReady(true);
  }, [location, navigate]);

  if (!isReady) return null;

  return children;
}

// Private Route Guard
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('sell_token');
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <TokenCatcher>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/*" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
        </Routes>
      </TokenCatcher>
    </BrowserRouter>
  );
}
