import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import './RidePool.css';
import { callApi, BASEURL } from '../api';

const libraries = ['places', 'geometry'];

// Updated API key with proper permissions
const GOOGLE_MAPS_API_KEY = 'AIzaSyCW2KrrJgG3IL3_RkiTRGfSanLcmH7vqPw';

const RidePool = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [source, setSource] = useState('');
    const [destination, setDestination] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [passengers, setPassengers] = useState(1);
    const [distance, setDistance] = useState(0);
    const [price, setPrice] = useState(0);
    const [directions, setDirections] = useState(null);
    const [showMap, setShowMap] = useState(false);
    const [availableRides, setAvailableRides] = useState([]);
    const [gender, setGender] = useState('');
    const [sourceCoords, setSourceCoords] = useState(null);
    const [destCoords, setDestCoords] = useState(null);
    const [map, setMap] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [apiError, setApiError] = useState(null);

    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries: libraries
    });

    useEffect(() => {
        if (loadError) {
            setApiError('Failed to load Google Maps. Please check your internet connection and try again.');
            console.error('Google Maps loading error:', loadError);
        }
    }, [loadError]);

    const mapContainerStyle = {
        width: '100%',
        height: '400px'
    };

    const center = {
        lat: 20.5937,
        lng: 78.9629
    };

    const onLoad = useCallback(function callback(map) {
        setMap(map);
    }, []);

    const onUnmount = useCallback(function callback() {
        setMap(null);
    }, []);

    const getCoordinates = async (address) => {
        if (!isLoaded) {
            throw new Error('Google Maps not loaded');
        }

        if (apiError) {
            throw new Error(apiError);
        }

        return new Promise((resolve, reject) => {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ 
                address,
                region: 'in' // Restrict to India for better results
            }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    resolve({
                        lat: results[0].geometry.location.lat(),
                        lng: results[0].geometry.location.lng()
                    });
                } else {
                    let errorMessage = 'Could not find the location.';
                    switch (status) {
                        case 'REQUEST_DENIED':
                            errorMessage = 'Google Maps API key is invalid or has insufficient permissions.';
                            break;
                        case 'OVER_QUERY_LIMIT':
                            errorMessage = 'Google Maps API quota exceeded. Please try again later.';
                            break;
                        case 'ZERO_RESULTS':
                            errorMessage = 'No results found for this location. Please try a different address.';
                            break;
                        default:
                            errorMessage = `Geocoding failed: ${status}. Please try again.`;
                    }
                    reject(new Error(errorMessage));
                }
            });
        });
    };

    const calculateRoute = async () => {
        if (!source || !destination) {
            setError('Please enter both source and destination locations');
            return;
        }

        if (!isLoaded) {
            setError('Google Maps is still loading. Please wait a moment and try again.');
            return;
        }

        if (apiError) {
            setError(apiError);
            return;
        }

        setIsLoading(true);
        setError(null);
        setDirections(null);
        setDistance(0);
        setPrice(0);

        try {
            // Get coordinates for source and destination
            const [sourceLocation, destLocation] = await Promise.all([
                getCoordinates(source),
                getCoordinates(destination)
            ]);

            if (!sourceLocation || !destLocation) {
                throw new Error('Could not find coordinates for one or both locations');
            }

            setSourceCoords(sourceLocation);
            setDestCoords(destLocation);

            // Calculate route using Google Maps Directions Service
            const directionsService = new window.google.maps.DirectionsService();
            
            const result = await new Promise((resolve, reject) => {
                directionsService.route({
                    origin: sourceLocation,
                    destination: destLocation,
                    travelMode: window.google.maps.TravelMode.DRIVING,
                }, (result, status) => {
                    if (status === 'OK') {
                        resolve(result);
                    } else {
                        let errorMessage = 'Failed to calculate route.';
                        switch (status) {
                            case 'REQUEST_DENIED':
                                errorMessage = 'Google Maps API key is invalid or has insufficient permissions.';
                                break;
                            case 'OVER_QUERY_LIMIT':
                                errorMessage = 'Google Maps API quota exceeded. Please try again later.';
                                break;
                            case 'NOT_FOUND':
                                errorMessage = 'One or both locations could not be found.';
                                break;
                            case 'ZERO_RESULTS':
                                errorMessage = 'No route found between these locations.';
                                break;
                            default:
                                errorMessage = `Directions request failed: ${status}`;
                        }
                        reject(new Error(errorMessage));
                    }
                });
            });

            setDirections(result);
            const distanceInKm = result.routes[0].legs[0].distance.value / 1000;
            setDistance(distanceInKm);

            // Calculate price
            const calculatedPrice = distanceInKm * 10; // ₹10 per km
            setPrice(calculatedPrice);

            // Call backend API to save the calculation
            callApi('POST', `${BASEURL}api/distance/calculate`, {
                source,
                destination,
                distance: distanceInKm,
                price: calculatedPrice
            }, (responseData) => {
                if (responseData && responseData.price) {
                    setPrice(responseData.price);
                }
            });

            setShowMap(true);
        } catch (error) {
            console.error('Error calculating route:', error);
            setError(error.message || 'Error calculating route. Please check your locations and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleShareRide = () => {
        if (!gender) {
            alert('Please select your gender preference');
            return;
        }

        const newRide = {
            id: Date.now(),
            source,
            destination,
            distance,
            price,
            gender,
            timestamp: new Date().toISOString()
        };

        // Save ride to backend
        callApi('POST', `${BASEURL}api/rides/save`, newRide, (response) => {
            if (response) {
                setAvailableRides([...availableRides, newRide]);
                alert('Ride shared successfully!');
            } else {
                alert('Failed to share ride. Please try again.');
            }
        });
    };

    const handleBack = () => {
        try {
            navigate('/home', {
                replace: true,
                state: { fromProtectedRoute: true }
            });
        } catch (error) {
            console.error('Navigation error:', error);
            window.location.href = '/home';
        }
    };

    const handleLogout = () => {
        try {
            localStorage.removeItem('isAuthenticated');
            navigate('/home', {
                replace: true,
                state: { fromProtectedRoute: true }
            });
        } catch (error) {
            console.error('Navigation error:', error);
            window.location.href = '/home';
        }
    };

    useEffect(() => {
        const isAuthenticated = localStorage.getItem('isAuthenticated');
        const isFromHome = location.state?.fromHome;

        if (!isAuthenticated || !isFromHome) {
            navigate('/home', {
                replace: true,
                state: { fromProtectedRoute: true }
            });
        }
    }, [navigate, location]);

    if (!isLoaded) {
        return <div className="loading">Loading maps...</div>;
    }

    if (apiError) {
        return (
            <div className="error-container">
                <h2>Error Loading Maps</h2>
                <p>{apiError}</p>
                <button onClick={() => window.location.reload()}>Retry</button>
            </div>
        );
    }

    return (
        <div className="ride-pool-container">
            <div className="ride-pool-header">
                <button className="back-button" onClick={handleBack}>
                    <FaArrowLeft /> Back
                </button>
                <h2>Share Your Ride</h2>
                <p>Find people going your way and split the cost!</p>
            </div>

            <div className="ride-pool-form">
                <div className="form-group">
                    <label>Pickup Location</label>
                    <input
                        type="text"
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                        placeholder="Enter pickup location"
                        className="form-control"
                    />
                </div>

                <div className="form-group">
                    <label>Drop Location</label>
                    <input
                        type="text"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        placeholder="Enter drop location"
                        className="form-control"
                    />
                </div>

                <button 
                    className="calculate-button"
                    onClick={calculateRoute}
                    disabled={isLoading}
                >
                    {isLoading ? 'Calculating...' : 'Calculate Route'}
                </button>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {showMap && (
                <div className="map-container">
                    <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={center}
                        zoom={10}
                        onLoad={onLoad}
                        onUnmount={onUnmount}
                    >
                        {directions && <DirectionsRenderer directions={directions} />}
                        {sourceCoords && (
                            <Marker
                                position={sourceCoords}
                                icon={{
                                    url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
                                }}
                            />
                        )}
                        {destCoords && (
                            <Marker
                                position={destCoords}
                                icon={{
                                    url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
                                }}
                            />
                        )}
                    </GoogleMap>
                </div>
            )}

            {distance > 0 && (
                <div className="ride-details">
                    <div className="detail-card">
                        <h3>Ride Details</h3>
                        <p>Distance: {distance.toFixed(2)} km</p>
                        <p>Price: ₹{price.toFixed(2)}</p>
                        <p>Price per person: ₹{(price / passengers).toFixed(2)}</p>

                        <div className="gender-selection">
                            <h4>Select Gender Preference</h4>
                            <div className="gender-options">
                                <label className="gender-option">
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="male"
                                        checked={gender === 'male'}
                                        onChange={(e) => setGender(e.target.value)}
                                    />
                                    Male
                                </label>
                                <label className="gender-option">
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="female"
                                        checked={gender === 'female'}
                                        onChange={(e) => setGender(e.target.value)}
                                    />
                                    Female
                                </label>
                                <label className="gender-option">
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="other"
                                        checked={gender === 'other'}
                                        onChange={(e) => setGender(e.target.value)}
                                    />
                                    Other
                                </label>
                            </div>
                        </div>

                        <button 
                            className="share-button"
                            onClick={handleShareRide}
                        >
                            Share This Ride
                        </button>
                    </div>
                </div>
            )}

            {availableRides.length > 0 && (
                <div className="available-rides">
                    <h3>Available Rides</h3>
                    <div className="rides-grid">
                        {availableRides.map(ride => (
                            <div key={ride.id} className="ride-card">
                                <div className="ride-info">
                                    <p><strong>From:</strong> {ride.source}</p>
                                    <p><strong>To:</strong> {ride.destination}</p>
                                    <p><strong>Distance:</strong> {ride.distance.toFixed(2)} km</p>
                                    <p><strong>Price per person:</strong> ₹{(ride.price / 2).toFixed(2)}</p>
                                    <p><strong>Gender Preference:</strong> {ride.gender}</p>
                                </div>
                                <button className="join-button">Join Ride</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RidePool;
