import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import Home from './Home.jsx';
import RideBooking from './RideBooking.jsx';
import MapView from './MapView.jsx';
import RidePool from './components/RidePool.jsx';
import Vehicle from './Vehicle.jsx';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated');
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path='/' element={<App />} />
      <Route path='/home' element={
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      } />
      <Route path='/ride' element={
        <ProtectedRoute>
          <RideBooking />
        </ProtectedRoute>
      } />
      <Route path='/map' element={
        <ProtectedRoute>
          <MapView />
        </ProtectedRoute>
      } />
      <Route path='/share' element={
        <ProtectedRoute>
          <RidePool />
        </ProtectedRoute>
      } />
      <Route path='/vehicle' element={
        <ProtectedRoute>
          <Vehicle />
        </ProtectedRoute>
      } />
      <Route path='*' element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);
