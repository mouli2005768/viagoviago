import React, { useState, useEffect } from "react";
import "./Home.css";
import { BASEURL, callApi } from "./api";
import { useNavigate, useLocation } from "react-router-dom";
import RideBooking from "./RideBooking";

const Home = ({ userData, setUserData }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if we're coming from a protected route
    const isFromProtectedRoute = location.state?.fromProtectedRoute;
    
    // Set authentication state when component mounts
    if (!localStorage.getItem('isAuthenticated')) {
      localStorage.setItem('isAuthenticated', 'true');
    }

    // If we're coming from a protected route, redirect back
    if (isFromProtectedRoute) {
      const returnPath = location.state?.returnPath || '/home';
      navigate(returnPath, { replace: true });
    }
  }, [location, navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    const data = JSON.stringify({ email, password });

    callApi("POST", `${BASEURL}user/login`, data, (response) => {
      if (response) {
        const parsedData = JSON.parse(response);
        setUserData(parsedData);
      }
    });
  };

  const handleRideClick = () => {
    try {
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/ride', { 
        replace: true,
        state: { fromHome: true }
      });
    } catch (error) {
      console.error('Navigation error:', error);
      window.location.href = '/ride';
    }
  };
   
  const handleShareClick = () => {
    try {
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/share', { 
        replace: true,
        state: { fromHome: true }
      });
    } catch (error) {
      console.error('Navigation error:', error);
      window.location.href = '/share';
    }
  };

  const handleVehicleClick = () => {
    try {
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/vehicle', { 
        replace: true,
        state: { fromHome: true }
      });
    } catch (error) {
      console.error('Navigation error:', error);
      window.location.href = '/vehicle';
    }
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <h1 className="home-title">VIA GO</h1>
        <p className="header-description">
          Experience seamless transportation with ViaGo - Your trusted partner for
          convenient rides, vehicle rentals, and ride-sharing solutions. Travel
          smarter, travel better.
        </p>
      </header>

      <main className="home-content">
        <div className="image-container">
          <div className="image-item">
            <div className="image-space">
              <img 
                src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=1470&auto=format&fit=crop" 
                alt="Ride Service" 
                className="service-image"
              />
            </div>
            <button 
              className="action-button" 
              onClick={handleRideClick}
              style={{ cursor: 'pointer' }}
            >
              Ride
            </button>
          </div>
          
          <div className="image-item">
            <div className="image-space">
              <img 
                src="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=1470&auto=format&fit=crop" 
                alt="Vehicle Service" 
                className="service-image"
              />
            </div>
            <button 
              className="action-button" 
              onClick={handleVehicleClick}
              style={{ cursor: 'pointer' }}
            >
              Vehicle
            </button>
          </div>

          <div className="image-item">
            <div className="image-space">
              <img 
                src="https://images.unsplash.com/photo-1532931899774-fbd4de0008fb?q=80&w=1469&auto=format&fit=crop" 
                alt="Share Ride Service" 
                className="service-image"
              />
            </div>
            <button 
              className="action-button" 
              onClick={handleShareClick}
              style={{ cursor: 'pointer' }}
            >
              Share
            </button>
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2024 ViaGo. All Rights Reserved.</p>
          <div className="footer-links">
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
            <a href="/contact">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
