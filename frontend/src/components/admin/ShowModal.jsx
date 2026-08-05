import React, { useState, useEffect } from 'react';
import { X, Calendar, Ticket } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const ShowModal = ({ onClose, onSuccess }) => {
  const { showToast } = useToast();
  const [movies, setMovies] = useState([]);
  const [formData, setFormData] = useState({
    movie_id: '',
    screen_name: 'Screen 1 (IMAX)',
    show_time: new Date(Date.now() + 86400000).toISOString().slice(0, 16), // Tomorrow
    price_per_seat: 12.50,
    rows: 6,
    cols: 10,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMoviesList();
  }, []);

  const fetchMoviesList = async () => {
    try {
      const response = await api.get('/movies?limit=50');
      const items = response.data.items || [];
      setMovies(items);
      if (items.length > 0) {
        setFormData((prev) => ({ ...prev, movie_id: items[0].id }));
      }
    } catch (error) {
      console.error('Error fetching movies for show modal:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.movie_id) {
      showToast('Please select a movie to schedule.', 'error');
      return;
    }

    setLoading(true);
    try {
      await api.post('/shows', {
        ...formData,
        price_per_seat: parseFloat(formData.price_per_seat),
        rows: parseInt(formData.rows, 10),
        cols: parseInt(formData.cols, 10),
        total_seats: parseInt(formData.rows, 10) * parseInt(formData.cols, 10),
      });

      showToast('Showtime scheduled successfully!', 'success');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error scheduling show:', error);
      const msg = error.response?.data?.detail || 'Failed to schedule showtime.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
    }}>
      <div className="card-glass" style={{ width: '100%', maxWidth: '520px', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar color="var(--accent)" /> Schedule New Showtime
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Select Movie</label>
            <select
              name="movie_id"
              className="form-input"
              value={formData.movie_id}
              onChange={handleChange}
              required
            >
              {movies.map((m) => (
                <option key={m.id} value={m.id} style={{ background: 'var(--bg-surface)', color: '#fff' }}>
                  {m.title} ({m.language})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Cinema Screen Hall</label>
            <input
              type="text"
              name="screen_name"
              className="form-input"
              value={formData.screen_name}
              onChange={handleChange}
              placeholder="e.g. Screen 1 (IMAX)"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Show Date & Time</label>
            <input
              type="datetime-local"
              name="show_time"
              className="form-input"
              value={formData.show_time}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Ticket Price ($)</label>
              <input
                type="number"
                step="0.5"
                name="price_per_seat"
                className="form-input"
                value={formData.price_per_seat}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Seating Capacity</label>
              <input
                type="text"
                className="form-input"
                value={`${formData.rows} Rows × ${formData.cols} Cols (${formData.rows * formData.cols} Seats)`}
                disabled
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 1 }}>
              {loading ? 'Scheduling...' : 'Schedule Showtime'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShowModal;
