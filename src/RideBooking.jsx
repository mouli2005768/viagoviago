import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from '@react-google-maps/api';
import './RideBooking.css';
import { FaHome, FaCar, FaHistory, FaUser, FaCog, FaSignOutAlt, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaUsers, FaArrowLeft } from 'react-icons/fa';
import { callApi, BASEURL } from './api';

const libraries = ['places'];

const RideBooking = () => {
    const navigate = useNavigate();
    const [source, setSource] = useState('');
    const [destination, setDestination] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [passengers, setPassengers] = useState(1);
    const [directions, setDirections] = useState(null);
    const [distance, setDistance] = useState(null);
    const [price, setPrice] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: 'AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg',
        libraries: libraries
    });

    const mapContainerStyle = {
        width: '100%',
        height: '400px',
        borderRadius: '15px',
        marginTop: '20px'
    };

    const center = {
        lat: 20.5937,
        lng: 78.9629
    };

    useEffect(() => {
        // Check authentication on mount
        const isAuthenticated = localStorage.getItem('isAuthenticated');
        if (!isAuthenticated) {
            navigate('/home');
        }

        // Cleanup on unmount
        return () => {
            // Don't remove authentication here as it's managed by Home component
        };
    }, [navigate]);

    const calculateRoute = async () => {
        if (!source || !destination || !isLoaded) {
            setError('Please enter both pickup and drop locations');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const directionsService = new window.google.maps.DirectionsService();
            const result = await directionsService.route({
                origin: source,
                destination: destination,
                travelMode: window.google.maps.TravelMode.DRIVING,
            });

            setDirections(result);
            const distanceInKm = result.routes[0].legs[0].distance.value / 1000;
            setDistance(distanceInKm);

            // Call the backend API to get the price
            callApi('POST', `${BASEURL}api/distance/calculate`, {
                source,
                destination
            }, (responseData) => {
                setPrice(responseData.price);
            });

        } catch (error) {
            console.error('Error calculating route:', error);
            setError('Error calculating route. Please check your locations and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBooking = () => {
        if (!source || !destination || !date || !time) {
            setError('Please fill in all required fields');
            return;
        }

        // Call the save ride API
        callApi('POST', `${BASEURL}api/rides/save`, {
            source,
            destination,
            date,
            time,
            passengers,
            price,
            distance
        }, (response) => {
            if (response.success) {
                alert('Booking confirmed!');
                navigate('/home');
            } else {
                setError('Failed to book ride. Please try again.');
            }
        });
    };

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        navigate('/home');
    };

    const handleBack = () => {
        navigate('/home');
    };

    if (!isLoaded) {
        return <div className="loading">Loading maps...</div>;
    }

    return (
        <div className="ride-booking-container">
            <header className="ride-booking-header">
                <button className="back-button" onClick={handleBack}>
                    <FaArrowLeft /> Back
                </button>
                <h1>ViaGo Ride Booking</h1>
                <p>Book your ride with comfort and convenience</p>
            </header>

            <div className="ride-booking-content">
                <aside className="sidebar">
                    <div className="sidebar-profile">
                        <img 
                            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1000&auto=format&fit=crop" 
                            alt="Profile" 
                            className="profile-image"
                        />
                        <h3>Welcome, User!</h3>
                    </div>
                    <ul className="sidebar-menu">
                        <li>
                            <a href="#"><FaHome /> Home</a>
                        </li>
                        <li>
                            <a href="#"><FaCar /> My Rides</a>
                        </li>
                        <li>
                            <a href="#"><FaHistory /> Ride History</a>
                        </li>
                        <li>
                            <a href="#"><FaUser /> Profile</a>
                        </li>
                        <li>
                            <a href="#"><FaCog /> Settings</a>
                        </li>
                        <li>
                            <a href="#" onClick={handleLogout}><FaSignOutAlt /> Logout</a>
                        </li>
                    </ul>
                </aside>

                <main className="main-content">
                    <div className="booking-form">
                        {error && <div className="error-message">{error}</div>}
                        
                        <div className="form-group">
                            <label><FaMapMarkerAlt /> Pickup Location</label>
                            <input
                                type="text"
                                value={source}
                                onChange={(e) => setSource(e.target.value)}
                                placeholder="Enter pickup location"
                                className="form-control"
                            />
                        </div>

                        <div className="form-group">
                            <label><FaMapMarkerAlt /> Drop Location</label>
                            <input
                                type="text"
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                                placeholder="Enter drop location"
                                className="form-control"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label><FaCalendarAlt /> Date</label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group">
                                <label><FaClock /> Time</label>
                                <input
                                    type="time"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group">
                                <label><FaUsers /> Passengers</label>
                                <input
                                    type="number"
                                    value={passengers}
                                    onChange={(e) => setPassengers(e.target.value)}
                                    min="1"
                                    max="4"
                                    className="form-control"
                                />
                            </div>
                        </div>

                        <button 
                            className="booking-button"
                            onClick={calculateRoute}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className="loading-spinner"></span>
                                    Calculating...
                                </>
                            ) : (
                                'Calculate Route'
                            )}
                        </button>

                        {directions && (
                            <GoogleMap
                                mapContainerStyle={mapContainerStyle}
                                center={center}
                                zoom={10}
                            >
                                <DirectionsRenderer directions={directions} />
                            </GoogleMap>
                        )}

                        {distance && price && (
                            <div className="price-display">
                                <p>Distance: {distance.toFixed(2)} km</p>
                                <p className="price-amount">Estimated Price: ₹{price.toFixed(2)}</p>
                                <button 
                                    className="booking-button"
                                    onClick={handleBooking}
                                >
                                    Book Now
                                </button>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            <footer className="ride-booking-footer">
                <div className="footer-content">
                    <div className="footer-logo">
                        <img 
                            src="https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?q=80&w=1000&auto=format&fit=crop" 
                            alt="ViaGo Logo" 
                            className="footer-logo-image"
                        />
                    </div>
                    <div className="footer-links">
                        <a href="#">About Us</a>
                        <a href="#">Contact</a>
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Service</a>
                    </div>
                    <div className="footer-social">
                        <a href="#"><i className="fab fa-facebook"></i></a>
                        <a href="#"><i className="fab fa-twitter"></i></a>
                        <a href="#"><i className="fab fa-instagram"></i></a>
                    </div>
                </div>
                <p className="footer-copyright">© 2024 ViaGo. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default RideBooking;
