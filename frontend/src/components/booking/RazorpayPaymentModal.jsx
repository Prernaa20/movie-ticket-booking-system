import React, { useState } from 'react';
import { CreditCard, QrCode, ShieldCheck, Lock, CheckCircle2, AlertCircle, X, Smartphone, Building } from 'lucide-react';

const RazorpayPaymentModal = ({ show, selectedSeats, totalAmount, onPaymentSuccess, onClose }) => {
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'card' | 'netbanking'
  const [upiId, setUpiId] = useState('demo@upi');
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('123');
  const [processing, setProcessing] = useState(false);

  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => {
      onPaymentSuccess({
        razorpay_order_id: `order_rzp_${Math.random().toString(36).substring(2, 12)}`,
        razorpay_payment_id: `pay_rzp_${Math.random().toString(36).substring(2, 14)}`,
        razorpay_signature: 'test_signature_valid',
      });
      setProcessing(false);
    }, 1200);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '1rem',
    }}>
      <div style={{
        background: '#0d131f',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '460px',
        overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
      }}>
        {/* Header with Razorpay Logo branding */}
        <div style={{
          background: 'linear-gradient(135deg, #0c2340 0%, #112a46 100%)',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#3b82f6', letterSpacing: '-0.5px' }}>
                Razorpay
              </span>
              <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>TEST MODE</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>
              CinePass Cinemas • ${totalAmount.toFixed(2)}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.8 }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem' }}>
          
          {/* Booking Summary Strip */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '10px',
            padding: '0.85rem 1rem',
            marginBottom: '1.25rem',
            fontSize: '0.85rem',
            display: 'flex',
            justify: 'space-between',
          }}>
            <div>
              <div style={{ color: '#fff', fontWeight: 700 }}>{show?.movie?.title}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Seats: {selectedSeats.join(', ')}</div>
            </div>
            <div style={{ textAlign: 'right', color: '#34d399', fontWeight: 800, fontSize: '1rem' }}>
              ${totalAmount.toFixed(2)}
            </div>
          </div>

          {/* Payment Method Selector Tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '1.25rem' }}>
            <button
              onClick={() => setPaymentMethod('upi')}
              style={{
                padding: '10px 4px',
                borderRadius: '8px',
                border: paymentMethod === 'upi' ? '1px solid #3b82f6' : '1px solid var(--border)',
                background: paymentMethod === 'upi' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.02)',
                color: paymentMethod === 'upi' ? '#60a5fa' : 'var(--text-muted)',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Smartphone size={16} /> UPI / QR
            </button>

            <button
              onClick={() => setPaymentMethod('card')}
              style={{
                padding: '10px 4px',
                borderRadius: '8px',
                border: paymentMethod === 'card' ? '1px solid #3b82f6' : '1px solid var(--border)',
                background: paymentMethod === 'card' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.02)',
                color: paymentMethod === 'card' ? '#60a5fa' : 'var(--text-muted)',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <CreditCard size={16} /> Card
            </button>

            <button
              onClick={() => setPaymentMethod('netbanking')}
              style={{
                padding: '10px 4px',
                borderRadius: '8px',
                border: paymentMethod === 'netbanking' ? '1px solid #3b82f6' : '1px solid var(--border)',
                background: paymentMethod === 'netbanking' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.02)',
                color: paymentMethod === 'netbanking' ? '#60a5fa' : 'var(--text-muted)',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Building size={16} /> NetBanking
            </button>
          </div>

          {/* Form Content based on Method */}
          {paymentMethod === 'upi' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                Enter Virtual Payment Address (UPI ID)
              </label>
              <input
                type="text"
                className="input-field"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g. name@upi or googlepay"
                style={{ marginBottom: '1rem' }}
              />
              <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
                <span className="badge badge-secondary" style={{ fontSize: '0.7rem' }}>GPay</span>
                <span className="badge badge-secondary" style={{ fontSize: '0.7rem' }}>PhonePe</span>
                <span className="badge badge-secondary" style={{ fontSize: '0.7rem' }}>Paytm</span>
                <span className="badge badge-secondary" style={{ fontSize: '0.7rem' }}>BHIM</span>
              </div>
            </div>
          )}

          {paymentMethod === 'card' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                Card Number
              </label>
              <input
                type="text"
                className="input-field"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                style={{ marginBottom: '0.75rem' }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    CVV
                  </label>
                  <input
                    type="password"
                    className="input-field"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'netbanking' && (
            <div style={{ marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Select Popular Bank:
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '0.5rem' }}>
                <button className="btn btn-secondary" style={{ fontSize: '0.75rem', justifyContent: 'center' }}>HDFC Bank</button>
                <button className="btn btn-secondary" style={{ fontSize: '0.75rem', justifyContent: 'center' }}>ICICI Bank</button>
                <button className="btn btn-secondary" style={{ fontSize: '0.75rem', justifyContent: 'center' }}>SBI Bank</button>
                <button className="btn btn-secondary" style={{ fontSize: '0.75rem', justifyContent: 'center' }}>Axis Bank</button>
              </div>
            </div>
          )}

          {/* Pay Button */}
          <button
            onClick={handlePay}
            disabled={processing}
            style={{
              width: '100%',
              padding: '0.85rem',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#fff',
              fontSize: '1rem',
              fontWeight: 800,
              cursor: processing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(37, 99, 235, 0.4)',
            }}
          >
            <Lock size={16} /> {processing ? 'Processing Razorpay Payment...' : `Pay $${totalAmount.toFixed(2)}`}
          </button>

          {/* Security Guarantee */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            fontSize: '0.75rem',
            color: 'var(--text-subtle)',
            marginTop: '1rem',
          }}>
            <ShieldCheck size={14} color="#34d399" /> 256-bit Encrypted SSL Payment Guarantee
          </div>
        </div>
      </div>
    </div>
  );
};

export default RazorpayPaymentModal;
