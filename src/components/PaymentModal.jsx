import React, { useState } from 'react';
import './PaymentModal.css';

const PaymentModal = ({ vehicle, onClose, onPaymentComplete }) => {
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: '',
    days: 1
  });
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' or 'phonepe'

  const handleSubmit = (e) => {
    e.preventDefault();
    if (paymentMethod === 'card') {
      // Here you would typically integrate with a payment gateway 
      const totalAmount = vehicle.price * paymentDetails.days;
      alert(`Payment successful! Total amount: ₹${totalAmount}`);
      onPaymentComplete();
    }
  };

  const handlePhonePePayment = () => {
    const totalAmount = vehicle.price * paymentDetails.days;
    // In a real application, you would generate a dynamic QR code
    // For demo purposes, we're using a static PhonePe QR code
    const phonePeUrl = `upi://pay?pa=your-merchant-id@ybl&pn=ViaGo&am=${totalAmount}&cu=INR&tn=Vehicle Rental`;
    window.open(phonePeUrl, '_blank');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>×</button>
        <h2>Complete Your Booking</h2>
        <div className="vehicle-summary">
          <img src={vehicle.image} alt={vehicle.name} />
          <div className="vehicle-details">
            <h3>{vehicle.name}</h3>
            <p>Price per day: ₹{vehicle.price}</p>
          </div>
        </div>

        <div className="payment-methods">
          <button 
            className={`payment-method-btn ${paymentMethod === 'card' ? 'active' : ''}`}
            onClick={() => setPaymentMethod('card')}
          >
            Credit/Debit Card
          </button>
          <button 
            className={`payment-method-btn ${paymentMethod === 'phonepe' ? 'active' : ''}`}
            onClick={() => setPaymentMethod('phonepe')}
          >
            PhonePe
          </button>
        </div>
        
        {paymentMethod === 'card' ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Number of Days</label>
              <input
                type="number"
                min="1"
                value={paymentDetails.days}
                onChange={(e) => setPaymentDetails({...paymentDetails, days: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Card Number</label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                value={paymentDetails.cardNumber}
                onChange={(e) => setPaymentDetails({...paymentDetails, cardNumber: e.target.value})}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Expiry Date</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={paymentDetails.expiryDate}
                  onChange={(e) => setPaymentDetails({...paymentDetails, expiryDate: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>CVV</label>
                <input
                  type="text"
                  placeholder="123"
                  value={paymentDetails.cvv}
                  onChange={(e) => setPaymentDetails({...paymentDetails, cvv: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Card Holder Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={paymentDetails.name}
                onChange={(e) => setPaymentDetails({...paymentDetails, name: e.target.value})}
                required
              />
            </div>

            <div className="total-amount">
              <h3>Total Amount: ₹{vehicle.price * paymentDetails.days}</h3>
            </div>

            <button type="submit" className="pay-button">Pay Now</button>
          </form>
        ) : (
          <div className="phonepe-payment">
            <div className="form-group">
              <label>Number of Days</label>
              <input
                type="number"
                min="1"
                value={paymentDetails.days}
                onChange={(e) => setPaymentDetails({...paymentDetails, days: e.target.value})}
                required
              />
            </div>
            
            <div className="total-amount">
              <h3>Total Amount: ₹{vehicle.price * paymentDetails.days}</h3>
            </div>

            <div className="phonepe-qr">
              <img 
                src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=your-merchant-id@ybl&pn=ViaGo&am=1000&cu=INR&tn=Vehicle%20Rental" 
                alt="PhonePe QR Code"
              />
              <p>Scan QR code with PhonePe app</p>
            </div>

            <button onClick={handlePhonePePayment} className="pay-button phonepe-button">
              Pay with PhonePe
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
