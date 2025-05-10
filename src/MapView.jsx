import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom'; // Import the hook to get location state
import './MapView.css';

const vehicleOptions = [
  { type: 'Auto', price: '₹50', image: 'auto.png' },
  { type: 'Bike', price: '₹40', image: 'bike.png' },
  { type: 'Mini Car', price: '₹70', image: 'car.png' },
  { type: 'SUV Car', price: '₹90', image: 'car.png' },
];

const MapView = () => {
  const { state } = useLocation();  // Use `useLocation` to access state passed via navigation
  const { from, to } = state || {};  // Destructure from and to from the state object

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const directionsRenderer = useRef(null);

  useEffect(() => {
    if (!window.google) {
      console.error('Google Maps JavaScript API not loaded.');
      return;
    }

    // Check if the 'from' and 'to' locations are provided
    if (!from || !to) {
      console.error('Invalid locations provided.');
      return;
    }

    const directionsService = new window.google.maps.DirectionsService();
    directionsRenderer.current = new window.google.maps.DirectionsRenderer();

    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      zoom: 7,
      center: { lat: 20.5937, lng: 78.9629 }, // Center of India
    });

    directionsRenderer.current.setMap(mapInstance.current);

    directionsService.route(
      {
        origin: from,
        destination: to,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          directionsRenderer.current.setDirections(result);
        } else {
          console.error('Error fetching directions', result);
        }
      }
    );
  }, [from, to]);

  return (
    <div className="map-view-container">
      <div ref={mapRef} className="map-container"></div>
      <div className="vehicle-options">
        {vehicleOptions.map((vehicle, index) => (
          <div key={index} className="vehicle-card">
            <img src={vehicle.image} alt={vehicle.type} className="vehicle-image" />
            <div className="vehicle-info">
              <h3>{vehicle.type}</h3>
              <p>{vehicle.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MapView;
