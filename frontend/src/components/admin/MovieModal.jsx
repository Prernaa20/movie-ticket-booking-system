import React, { useState, useEffect } from 'react';
import { X, Film, Upload } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const MovieModal = ({ movie, onClose, onSuccess }) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: 'Sci-Fi, Action',
    duration_mins: 120,
    release_date: new Date().toISOString().split('T')[0],
    language: 'English',
    poster_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
    rating: 8.5,
    is_active: true,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (movie) {
      setFormData({
        title: movie.title || '',
        description: movie.description || '',
        genre: Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre || '',
        duration_mins: movie.duration_mins || 120,
        release_date: movie.release_date || new Date().toISOString().split('T')[0],
        language: movie.language || 'English',
        poster_url: movie.poster_url || '',
        rating: movie.rating || 8.5,
        is_active: movie.is_active !== undefined ? movie.is_active : true,
      });
    }
  }, [movie]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      duration_mins: parseInt(formData.duration_mins, 10),
      rating: parseFloat(formData.rating),
      genre: formData.genre.split(',').map((g) => g.trim()).filter(Boolean),
    };

    try {
      if (movie) {
        await api.put(`/movies/${movie.id}`, payload);
        showToast('Movie updated successfully!', 'success');
      } else {
        await api.post('/movies', payload);
        showToast('New movie added to catalog!', 'success');
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving movie:', error);
      const msg = error.response?.data?.detail || 'Failed to save movie details.';
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
      <div className="card-glass" style={{ width: '100%', maxWidth: '580px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Film color="var(--primary)" /> {movie ? 'Edit Movie Details' : 'Add New Movie to Catalog'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Movie Title</label>
            <input
              type="text"
              name="title"
              className="form-input"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Interstellar"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Synopsis Description</label>
            <textarea
              name="description"
              className="form-input"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter plot summary..."
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Genres (Comma-separated)</label>
              <input
                type="text"
                name="genre"
                className="form-input"
                value={formData.genre}
                onChange={handleChange}
                placeholder="Sci-Fi, Action, Drama"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Duration (Minutes)</label>
              <input
                type="number"
                name="duration_mins"
                className="form-input"
                value={formData.duration_mins}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Audio Language</label>
              <input
                type="text"
                name="language"
                className="form-input"
                value={formData.language}
                onChange={handleChange}
                placeholder="English"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">IMDb Rating (0.0 - 10.0)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                name="rating"
                className="form-input"
                value={formData.rating}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">HD Poster Image URL</label>
            <input
              type="url"
              name="poster_url"
              className="form-input"
              value={formData.poster_url}
              onChange={handleChange}
              placeholder="https://images.unsplash.com/..."
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 1 }}>
              {loading ? 'Saving Movie...' : movie ? 'Update Movie' : 'Create Movie'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MovieModal;
