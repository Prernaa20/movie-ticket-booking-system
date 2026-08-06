import React, { useState, useEffect } from 'react';
import { Shield, DollarSign, Ticket, Film, Calendar, Users, Plus, Edit, Trash2, Mail, UserCheck } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import MovieModal from '../../components/admin/MovieModal';
import ShowModal from '../../components/admin/ShowModal';

const AdminDashboardPage = () => {
  const { showToast } = useToast();
  const [stats, setStats] = useState(null);
  const [movies, setMovies] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [activeTab, setActiveTab] = useState('movies'); // 'movies' | 'users' | 'bookings'
  const [loading, setLoading] = useState(true);

  // Modal controls
  const [showMovieModal, setShowMovieModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [showShowModal, setShowShowModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, moviesRes, usersRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/movies?limit=100'),
        api.get('/admin/users'),
      ]);
      setStats(statsRes.data);
      setMovies(moviesRes.data.items || []);
      setUsersList(usersRes.data || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      showToast('Failed to load admin metrics.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMovie = async (movieId, movieTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${movieTitle}"? This will also remove associated showtimes.`)) {
      return;
    }

    try {
      await api.delete(`/movies/${movieId}`);
      showToast(`"${movieTitle}" deleted successfully.`, 'info');
      fetchDashboardData();
    } catch (error) {
      console.error('Error deleting movie:', error);
      showToast('Failed to delete movie.', 'error');
    }
  };

  return (
    <div className="container page-section">
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.25rem' }}>
            <Shield size={28} color="var(--accent)" />
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>
              Administrator Management Portal
            </h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            System overview, revenue metrics, movie catalog management, and registered user accounts
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => { setEditingMovie(null); setShowMovieModal(true); }}
            className="btn btn-primary"
            style={{ fontSize: '0.875rem' }}
          >
            <Plus size={16} /> Add New Movie
          </button>
          <button
            onClick={() => setShowShowModal(true)}
            className="btn btn-secondary"
            style={{ fontSize: '0.875rem' }}
          >
            <Calendar size={16} color="var(--accent)" /> Schedule Showtime
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: '1.25rem',
          marginBottom: '3rem',
        }}>
          <div className="card-glass" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Revenue</span>
              <DollarSign size={20} color="#34d399" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34d399' }}>
              ${stats.total_revenue.toFixed(2)}
            </div>
          </div>

          <div className="card-glass" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Bookings</span>
              <Ticket size={20} color="var(--primary)" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>
              {stats.total_bookings}
            </div>
          </div>

          <div className="card-glass" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Active Movies</span>
              <Film size={20} color="var(--accent)" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>
              {stats.total_movies}
            </div>
          </div>

          <div className="card-glass" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Scheduled Shows</span>
              <Calendar size={20} color="#60a5fa" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>
              {stats.total_shows}
            </div>
          </div>

          <div className="card-glass" style={{ padding: '1.25rem', cursor: 'pointer' }} onClick={() => setActiveTab('users')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Registered Users</span>
              <Users size={20} color="#a78bfa" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>
              {stats.total_users}
            </div>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        borderBottom: '1px solid var(--border)',
        marginBottom: '2rem',
      }}>
        <button
          onClick={() => setActiveTab('movies')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'movies' ? '2px solid var(--primary)' : '2px solid transparent',
            padding: '0.75rem 1.25rem',
            color: activeTab === 'movies' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
          }}
        >
          Movie Catalog ({movies.length})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'users' ? '2px solid var(--primary)' : '2px solid transparent',
            padding: '0.75rem 1.25rem',
            color: activeTab === 'users' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
          }}
        >
          User Accounts ({usersList.length})
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'bookings' ? '2px solid var(--primary)' : '2px solid transparent',
            padding: '0.75rem 1.25rem',
            color: activeTab === 'bookings' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
          }}
        >
          Recent Transactions
        </button>
      </div>

      {/* Movies Tab Data Table */}
      {activeTab === 'movies' && (
        <div className="card-glass" style={{ overflowX: 'auto', padding: '1rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '1rem' }}>Poster</th>
                <th style={{ padding: '1rem' }}>Title</th>
                <th style={{ padding: '1rem' }}>Genres</th>
                <th style={{ padding: '1rem' }}>Duration</th>
                <th style={{ padding: '1rem' }}>Rating</th>
                <th style={{ padding: '1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {movies.map((m) => (
                <tr key={m.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <img src={m.poster_url} alt={m.title} style={{ width: '40px', height: '55px', objectFit: 'cover', borderRadius: '6px' }} />
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#fff' }}>{m.title}</td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{m.genre.join(', ')}</td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{m.duration_mins} mins</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#fbbf24', fontWeight: 700 }}>⭐ {m.rating.toFixed(1)}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => { setEditingMovie(m); setShowMovieModal(true); }}
                        className="btn btn-secondary"
                        style={{ padding: '6px', fontSize: '0.75rem' }}
                        title="Edit Movie"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteMovie(m.id, m.title)}
                        className="btn btn-outline"
                        style={{ padding: '6px', fontSize: '0.75rem', borderColor: '#ef4444', color: '#ef4444' }}
                        title="Delete Movie"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* User Accounts Tab */}
      {activeTab === 'users' && (
        <div className="card-glass" style={{ overflowX: 'auto', padding: '1rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '1rem' }}>Full Name</th>
                <th style={{ padding: '1rem' }}>Email Address</th>
                <th style={{ padding: '1rem' }}>Account Role</th>
                <th style={{ padding: '1rem' }}>Registered On</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: u.role === 'admin' ? 'var(--accent)' : 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: '#fff',
                    }}>
                      {u.full_name.charAt(0).toUpperCase()}
                    </div>
                    {u.full_name}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{u.email}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span className={`badge ${u.role === 'admin' ? 'badge-amber' : 'badge-primary'}`}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && stats && (
        <div className="card-glass" style={{ overflowX: 'auto', padding: '1rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '1rem' }}>Ticket Code</th>
                <th style={{ padding: '1rem' }}>Movie</th>
                <th style={{ padding: '1rem' }}>Screen</th>
                <th style={{ padding: '1rem' }}>Seats</th>
                <th style={{ padding: '1rem' }}>Total Paid</th>
                <th style={{ padding: '1rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent_bookings.map((b) => (
                <tr key={b.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--accent)' }}>{b.booking_code}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#fff' }}>{b.movie_details?.title || 'Movie'}</td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{b.show_details?.screen_name || 'Screen'}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#fff' }}>{b.seat_numbers.join(', ')}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#34d399', fontWeight: 700 }}>${b.total_amount.toFixed(2)}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span className={`badge ${b.status === 'CONFIRMED' ? 'badge-success' : 'badge-primary'}`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {showMovieModal && (
        <MovieModal
          movie={editingMovie}
          onClose={() => { setShowMovieModal(false); setEditingMovie(null); }}
          onSuccess={fetchDashboardData}
        />
      )}

      {showShowModal && (
        <ShowModal
          onClose={() => setShowShowModal(false)}
          onSuccess={fetchDashboardData}
        />
      )}
    </div>
  );
};

export default AdminDashboardPage;
