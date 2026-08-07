import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Ticket, Film, Calendar, Clock, Check, Lock, ArrowLeft, CreditCard, ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import TicketReceiptModal from '../../components/booking/TicketReceiptModal';

const SeatSelectorPage = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();

  const [show, setShow] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completedBooking, setCompletedBooking] = useState(null);

  useEffect(() => {
    fetchShowDetails();
    loadRazorpayScript();
  }, [showId]);

  const fetchShowDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/shows/${showId}`);
      setShow(response.data);
    } catch (error) {
      console.error('Error fetching show details:', error);
      showToast('Failed to load showtime seat layout.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadRazorpayScript = () => {
    if (document.getElementById('razorpay-checkout-sdk')) return;
    const script = document.createElement('script');
    script.id = 'razorpay-checkout-sdk';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  };

  const handleSeatClick = (seatId, isBooked) => {
    if (isBooked) return;

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatId));
    } else {
      if (selectedSeats.length >= 8) {
        showToast('Maximum 8 seats allowed per single transaction.', 'info');
        return;
      }
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const handleRazorpayPayment = async () => {
    if (selectedSeats.length === 0) {
      showToast('Please select at least one seat before proceeding.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Create Razorpay Order via Backend
      const orderRes = await api.post('/payments/create-order', {
        show_id: showId,
        seat_numbers: selectedSeats,
      });

      const { order_id, amount, currency, key_id } = orderRes.data;

      // 2. Configure Razorpay Options Modal
      const options = {
        key: key_id || 'rzp_test_CinePassDemoKey123',
        amount: amount,
        currency: currency || 'INR',
        name: 'CinePass Cinemas',
        description: `Ticket Reservation for ${show?.movie?.title || 'Movie'} (${selectedSeats.join(', ')})`,
        image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200',
        order_id: order_id,
        handler: async function (response) {
          try {
            // 3. Verify Payment Signature on Backend
            const verifyRes = await api.post('/payments/verify-payment', {
              show_id: showId,
              seat_numbers: selectedSeats,
              razorpay_order_id: response.razorpay_order_id || order_id,
              razorpay_payment_id: response.razorpay_payment_id || `pay_${Date.now()}`,
              razorpay_signature: response.razorpay_signature || 'test_signature_valid',
            });

            showToast('Payment verified & Tickets booked successfully!', 'success');
            setCompletedBooking(verifyRes.data);
          } catch (verifyError) {
            console.error('Payment verification error:', verifyError);
            const msg = verifyError.response?.data?.detail || 'Payment verification failed.';
            showToast(msg, 'error');
            fetchShowDetails();
            setSelectedSeats([]);
          } finally {
            setSubmitting(false);
          }
        },
        prefill: {
          name: user?.full_name || 'Customer Name',
          email: user?.email || 'customer@example.com',
          contact: '9999999999',
        },
        notes: {
          movie: show?.movie?.title,
          seats: selectedSeats.join(', '),
        },
        theme: {
          color: '#e50914',
        },
        modal: {
          ondismiss: function () {
            setSubmitting(false);
            showToast('Payment cancelled by user.', 'info');
          },
        },
      };

      // 4. Trigger Razorpay Modal or direct fallback verification if SDK offline
      if (window.Razorpay) {
        const razorpayWindow = new window.Razorpay(options);
        razorpayWindow.open();
      } else {
        // Fallback for offline demo environments
        options.handler({
          razorpay_order_id: order_id,
          razorpay_payment_id: `pay_demo_${Date.now()}`,
          razorpay_signature: 'test_signature_valid',
        });
      }
    } catch (error) {
      console.error('Error initiating Razorpay payment:', error);
      const msg = error.response?.data?.detail || 'Could not initiate payment.';
      showToast(msg, 'error');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container page-section" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <Film size={40} color="var(--primary)" style={{ marginBottom: '1rem' }} />
        <div style={{ color: 'var(--text-muted)' }}>Loading cinema seating matrix...</div>
      </div>
    );
  }

  if (!show) return null;

  const rows = show.rows || 6;
  const cols = show.cols || 10;
  const bookedSeats = show.booked_seats || [];
  const pricePerSeat = show.price_per_seat || 12.50;

  const subtotal = selectedSeats.length * pricePerSeat;
  const serviceFee = selectedSeats.length > 0 ? 1.50 : 0.0;
  const totalAmount = subtotal + serviceFee;

  const rowLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  return (
    <div className="container page-section">
      <button
        onClick={() => navigate(-1)}
        className="btn btn-secondary"
        style={{ marginBottom: '1.5rem', padding: '6px 14px', fontSize: '0.85rem' }}
      >
        <ArrowLeft size={16} /> Back to Movie Details
      </button>

      {/* Header Summary */}
      <div className="card-glass" style={{ padding: '1.5rem', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="badge badge-amber" style={{ marginBottom: '0.5rem' }}>
              {show.screen_name}
            </span>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>
              {show.movie?.title || 'Movie Selection'}
            </h1>
            <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={14} /> {new Date(show.show_time).toLocaleDateString()}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} /> {new Date(show.show_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Ticket Price</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>
              ${pricePerSeat.toFixed(2)} <span style={{ fontSize: '0.85rem', fontWeight: 400, color: 'var(--text-muted)' }}>/ seat</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
        
        {/* Seating Layout Column */}
        <div style={{ gridColumn: 'span 2' }}>
          
          {/* Curved Screen Indicator */}
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{
              height: '8px',
              width: '80%',
              margin: '0 auto 0.75rem auto',
              background: 'linear-gradient(90deg, transparent 0%, var(--primary) 50%, transparent 100%)',
              borderRadius: '50%',
              boxShadow: '0 5px 25px var(--primary-glow)',
            }} />
            <div style={{ fontSize: '0.75rem', letterSpacing: '0.2em', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              CINEMA SCREEN - ALL EYES THIS WAY
            </div>
          </div>

          {/* Seat State Legend */}
          <div style={{
            display: 'flex',
            justify: 'center',
            gap: '1.5rem',
            marginBottom: '2rem',
            padding: '0.75rem',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '50px',
            border: '1px solid var(--border)',
            flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(15, 21, 35, 0.9)', border: '1px solid var(--border)' }} />
              Available
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#fff' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: 'var(--primary)', boxShadow: '0 0 10px var(--primary-glow)' }} />
              Selected
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-subtle)' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255,255,255,0.05)' }} />
              Reserved
            </div>
          </div>

          {/* Seating Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', overflowX: 'auto', paddingBottom: '1rem' }}>
            {Array.from({ length: rows }).map((_, rowIndex) => {
              const rowLetter = rowLetters[rowIndex] || `R${rowIndex + 1}`;
              return (
                <div key={rowLetter} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: '20px', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
                    {rowLetter}
                  </span>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {Array.from({ length: cols }).map((_, colIndex) => {
                      const seatNum = colIndex + 1;
                      const seatId = `${rowLetter}${seatNum}`;
                      const isBooked = bookedSeats.includes(seatId);
                      const isSelected = selectedSeats.includes(seatId);

                      return (
                        <button
                          key={seatId}
                          onClick={() => handleSeatClick(seatId, isBooked)}
                          disabled={isBooked}
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: isBooked ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease',
                            border: isSelected
                              ? '1px solid #ff4d55'
                              : isBooked
                              ? '1px solid rgba(255, 255, 255, 0.05)'
                              : '1px solid var(--border)',
                            background: isSelected
                              ? 'var(--primary)'
                              : isBooked
                              ? 'rgba(255, 255, 255, 0.06)'
                              : 'rgba(15, 21, 35, 0.9)',
                            color: isSelected
                              ? '#fff'
                              : isBooked
                              ? 'rgba(255, 255, 255, 0.2)'
                              : 'var(--text-muted)',
                            boxShadow: isSelected ? '0 0 12px var(--primary-glow)' : 'none',
                          }}
                        >
                          {isSelected ? <Check size={14} color="#fff" /> : isBooked ? <Lock size={12} color="rgba(255,255,255,0.2)" /> : seatNum}
                        </button>
                      );
                    })}
                  </div>

                  <span style={{ width: '20px', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
                    {rowLetter}
                  </span>
                </div>
              );
            })}
          </div>

        </div>

        {/* Order Checkout Column */}
        <div>
          <div className="card-glass" style={{ padding: '1.75rem', position: 'sticky', top: '90px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Ticket size={20} color="var(--primary)" /> Booking Summary
            </h3>

            {/* Selected Seats Pills */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Selected Seats ({selectedSeats.length})
              </div>
              {selectedSeats.length === 0 ? (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-subtle)', fontStyle: 'italic' }}>
                  No seats selected yet. Click on available grid seats.
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {selectedSeats.map((seat) => (
                    <span key={seat} className="badge badge-primary" style={{ fontSize: '0.85rem', padding: '4px 10px' }}>
                      Seat {seat}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Price Calculations */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Subtotal ({selectedSeats.length} × ${pricePerSeat.toFixed(2)})</span>
                <span style={{ color: '#fff' }}>${subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Service Fee</span>
                <span style={{ color: '#fff' }}>${serviceFee.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '1rem', fontSize: '1.15rem', fontWeight: 800 }}>
                <span style={{ color: '#fff' }}>Total Price</span>
                <span style={{ color: '#34d399' }}>${totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Razorpay Secured Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
              marginBottom: '1rem',
              background: 'rgba(255, 255, 255, 0.03)',
              padding: '6px',
              borderRadius: '6px',
            }}>
              <ShieldCheck size={14} color="#34d399" /> Secured by Razorpay Payment Gateway
            </div>

            {/* Confirm & Pay Button */}
            <button
              onClick={handleRazorpayPayment}
              disabled={selectedSeats.length === 0 || submitting}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', opacity: selectedSeats.length === 0 ? 0.5 : 1, gap: '8px' }}
            >
              <CreditCard size={18} /> {submitting ? 'Processing Payment...' : 'Proceed to Pay with Razorpay'}
            </button>
          </div>
        </div>

      </div>

      {/* Ticket Receipt Modal */}
      {completedBooking && (
        <TicketReceiptModal
          booking={completedBooking}
          onClose={() => setCompletedBooking(null)}
        />
      )}
    </div>
  );
};

export default SeatSelectorPage;
