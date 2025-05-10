import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCar, FaMotorcycle, FaBicycle, FaTruck } from 'react-icons/fa';
import PaymentModal from './components/PaymentModal';
import './Vehicle.css';

const Vehicle = () => {
    const navigate = useNavigate();
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [vehicles, setVehicles] = useState([
        {
            id: 1,
            type: 'car',
            name: 'Sedan',
            icon: <FaCar />,
            price: 15,
            seats: 4,
            image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1470&auto=format&fit=crop'
        },
        {
            id: 2,
            type: 'motorcycle',
            name: 'Motorcycle',
            icon: <FaMotorcycle />,
            price: 8,
            seats: 2,
            image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=1470&auto=format&fit=crop'
        },
        {
            id: 3,
            type: 'bicycle',
            name: 'Bicycle',
            icon: <FaBicycle />,
            price: 5,
            seats: 1,
            image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=1470&auto=format&fit=crop'
        },
        {
            id: 4,
            type: 'truck',
            name: 'Truck',
            icon: <FaTruck />,
            price: 25,
            seats: 3,
            image: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?q=80&w=1470&auto=format&fit=crop'
        }
    ]);

    useEffect(() => {
        const isAuthenticated = localStorage.getItem('isAuthenticated');
        if (!isAuthenticated) {
            navigate('/home');
        }
    }, [navigate]);

    const handleBack = () => {
        navigate('/home');
    };

    const handleVehicleSelect = (vehicle) => {
        setSelectedVehicle(vehicle);
    };

    const handleRent = () => {
        if (!selectedVehicle) {
            alert('Please select a vehicle first');
            return;
        }
        setShowPaymentModal(true);
    };

    const handlePaymentComplete = () => {
        setShowPaymentModal(false);
        alert('Thank you for your rental! Your vehicle will be ready for pickup.');
        navigate('/home');
    };

    return (
        <div className="vehicle-container">
            <header className="vehicle-header">
                <button className="back-button" onClick={handleBack}>
                    <FaArrowLeft /> Back
                </button>
                <h1>Vehicle Rental</h1>
                <p>Choose your preferred vehicle for rent</p>
            </header>

            <main className="vehicle-content">
                <div className="vehicle-grid">
                    {vehicles.map((vehicle) => (
                        <div 
                            key={vehicle.id} 
                            className={`vehicle-card ${selectedVehicle?.id === vehicle.id ? 'selected' : ''}`}
                            onClick={() => handleVehicleSelect(vehicle)}
                        >
                            <div className="vehicle-image">
                                <img src={vehicle.image} alt={vehicle.name} />
                            </div>
                            <div className="vehicle-info">
                                <div className="vehicle-icon">{vehicle.icon}</div>
                                <h3>{vehicle.name}</h3>
                                <p>₹{vehicle.price}/hour</p>
                                <p>{vehicle.seats} seats</p>
                            </div>
                        </div>
                    ))}
                </div>

                {selectedVehicle && (
                    <div className="rental-details">
                        <h2>Selected Vehicle: {selectedVehicle.name}</h2>
                        <div className="details-grid">
                            <div className="detail-item">
                                <span>Price per hour:</span>
                                <span>₹{selectedVehicle.price}</span>
                            </div>
                            <div className="detail-item">
                                <span>Seats:</span>
                                <span>{selectedVehicle.seats}</span>
                            </div>
                            <div className="detail-item">
                                <span>Type:</span>
                                <span>{selectedVehicle.type}</span>
                            </div>
                        </div>
                        <button className="rent-button" onClick={handleRent}>
                            Rent Now
                        </button>
                    </div>
                )}
            </main>

            <footer className="vehicle-footer">
                <div className="footer-content">
                    <p>&copy; 2024 ViaGo. All Rights Reserved.</p>
                    <div className="footer-links">
                        <a href="/privacy">Privacy Policy</a>
                        <a href="/terms">Terms of Service</a>
                        <a href="/contact">Contact Us</a>
                    </div>
                </div>
            </footer>

            {showPaymentModal && (
                <PaymentModal
                    vehicle={selectedVehicle}
                    onClose={() => setShowPaymentModal(false)}
                    onPaymentComplete={handlePaymentComplete}
                />
            )}
        </div>
    );
};

export default Vehicle; 