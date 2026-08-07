import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, CheckCircle, Calendar, Clock, MapPin, Printer, ArrowRight, QrCode } from 'lucide-react';

const TicketReceiptModal = ({ booking, onClose }) => {
  const navigate = useNavigate();

  if (!booking) return null;

  const showTimeDate = booking.show_details?.show_time
    ? new Date(booking.show_details.show_time)
    : new Date();

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      animation: 'fadeIn 0.3s ease',
    }}>
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '24px',
        maxWidth: '480px',
        width: '100%',
        overflow: 'hidden',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9)',
      }}>
        {/* Ticket Header Banner */}
        <div style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, #b90710 100%)',
          padding: '1.75rem',
          textAlign: 'center',
          color: '#fff',
          position: 'relative',
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(8px)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 0.75rem auto',
          }}>
            <CheckCircle size={28} color="#fff" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>
            Booking Confirmed!
          </h2>
          <p style={{ fontSize: '0.85rem', opacity: 0.9 }}>
            Your digital movie ticket is ready
          </p>
        </div>

        {/* Ticket Body */}
        <div style={{ padding: '1.75rem' }}>
          {/* Booking Code Banner */}
          <div style={{
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px dashed var(--accent)',
            borderRadius: '12px',
            padding: '0.85rem',
            textAlign: 'center',
            marginBottom: '1.5rem',
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600, textTransform: 'uppercase' }}>
              Confirmation Ticket Code
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', letterSpacing: '0.08em', marginTop: '2px' }}>
              {booking.booking_code}
            </div>
          </div>

          {/* Movie Details */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.25rem' }}>
            {booking.movie_details?.poster_url && (
              <img
                src={booking.movie_details.poster_url}
                alt="Poster"
                style={{ width: '65px', height: '90px', objectFit: 'cover', borderRadius: '10px' }}
              />
            )}
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>
                {booking.movie_details?.title || 'Movie Title'}
              </h3>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={14} color="var(--primary)" /> {booking.show_details?.screen_name || 'Screen 1'}
              </div>
            </div>
          </div>

          {/* Details Table */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '12px',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            fontSize: '0.875rem',
            color: 'var(--text-muted)',
            marginBottom: '1.5rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Showtime:</span>
              <strong style={{ color: '#fff' }}>
                {showTimeDate.toLocaleDateString()} at {showTimeDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Seats Reserved:</span>
              <strong style={{ color: 'var(--accent)' }}>
                {booking.seat_numbers.join(', ')} ({booking.seat_numbers.length} Seats)
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
              <span>Total Paid:</span>
              <strong style={{ color: '#34d399', fontSize: '1.1rem' }}>
                ${booking.total_amount.toFixed(2)}
              </strong>
            </div>
          </div>

          {/* QR Code Graphic */}
          <div style={{ textAlign: 'center', padding: '1rem', background: '#fff', borderRadius: '12px', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', color: '#000', fontWeight: 700, fontSize: '0.9rem' }}>
              <QrCode size={48} color="#000" />
              <div style={{ textAlign: 'left' }}>
                <div>SCAN AT CINEMA ENTRY</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 500, color: '#666' }}>CineMagic Digital Access</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => window.print()}
              className="btn btn-secondary"
              style={{ flex: 1, padding: '0.75rem', fontSize: '0.875rem' }}
            >
              <Printer size={16} /> Print Receipt
            </button>
            <button
              onClick={() => navigate('/my-bookings')}
              className="btn btn-primary"
              style={{ flex: 1, padding: '0.75rem', fontSize: '0.875rem' }}
            >
              My Bookings <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketReceiptModal;
