import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Calendar, Ticket, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

const ProfilePage = () => {
  const { user, isAdmin } = useAuth();
  const { showToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings/my-bookings');
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this ticket booking? Reserved seats will be released.')) {
      return;
    }

    try {
      await api.post(`/bookings/${bookingId}/cancel`);
      showToast('Booking cancelled successfully and seats released.', 'info');
      fetchBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      const msg = error.response?.data?.detail || 'Failed to cancel booking.';
      showToast(msg, 'error');
    }
  };

  if (!user) return null;

  return (
    <div className="container page-section">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* User Card */}
        <div>
          <div className="card-glass" style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: isAdmin ? 'var(--accent)' : 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: 800,
              color: '#fff',
              margin: '0 auto 1.5rem auto',
              boxShadow: `0 10px 25px ${isAdmin ? 'var(--accent-glow)' : 'var(--primary-glow)'}`,
            }}>
              {(user.full_name || user.email || 'User').charAt(0).toUpperCase()}
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>
              {user.full_name || user.email || 'User'}
            </h2>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <span className={`badge ${isAdmin ? 'badge-amber' : 'badge-primary'}`}>
                {isAdmin ? 'System Administrator' : 'Customer Account'}
              </span>
            </div>

            <div style={{
              borderTop: '1px solid var(--border)',
              paddingTop: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              textAlign: 'left',
              fontSize: '0.9rem',
              color: 'var(--text-muted)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Mail size={16} color="var(--primary)" />
                <span>{user.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Shield size={16} color="var(--accent)" />
                <span>Role: {user.role.toUpperCase()}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Calendar size={16} color="#60a5fa" />
                <span>Member Since: {new Date(user.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* My Bookings History */}
        <div style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <Ticket size={24} color="var(--primary)" />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>
              My Ticket History
            </h2>
          </div>

          {loading ? (
            <div style={{ color: 'var(--text-muted)' }}>Loading booking history...</div>
          ) : bookings.length === 0 ? (
            <div className="card-glass" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Ticket size={48} color="rgba(255,255,255,0.2)" style={{ marginBottom: '1rem' }} />
              <p>You haven't placed any movie ticket bookings yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {bookings.map((booking) => (
                <div key={booking.id} className="card-glass" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {booking.movie_details?.poster_url && (
                      <img
                        src={booking.movie_details.poster_url}
                        alt="Poster"
                        style={{ width: '60px', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
                      />
                    )}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                          {booking.movie_details?.title || 'Movie Show'}
                        </span>
                        <span className={`badge ${booking.status === 'CONFIRMED' ? 'badge-success' : 'badge-primary'}`}>
                          {booking.status}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        Ticket Code: <strong style={{ color: 'var(--accent)' }}>{booking.booking_code}</strong> | Screen: {booking.show_details?.screen_name || 'Screen'}
                      </div>

                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Seats Reserved: {booking.seat_numbers.join(', ')} | Price: ${booking.total_amount.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {booking.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className="btn btn-outline"
                      style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                    >
                      <XCircle size={14} /> Cancel Ticket
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
