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
    trailer_url: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
    rating: 8.5,
    is_active: true,
  });

  const [loading, setLoading] = useState(false);

  // Lock background body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

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
        trailer_url: movie.trailer_url || 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
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
      <div className="card-glass" style={{ width: '100%', maxWidth: '580px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto', background: '#090e17', position: 'relative', zIndex: 10001 }}>
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
            <label className="form-label">HD Poster Image URL or Local Path</label>
            <input
              type="text"
              name="poster_url"
              className="form-input"
              value={formData.poster_url}
              onChange={handleChange}
              placeholder="e.g. https://images.unsplash.com/... or /my_poster.jpg"
              required
            />
            {/* Poster Presets Picker */}
            <div style={{ marginTop: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', display: 'block', marginBottom: '0.35rem' }}>
                Or select a preset high-resolution poster:
              </span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, poster_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80' }))}
                  className="btn btn-secondary"
                  style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                >
                  🌌 Sci-Fi
                </button>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, poster_url: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&auto=format&fit=crop&q=80' }))}
                  className="btn btn-secondary"
                  style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                >
                  💥 Action
                </button>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, poster_url: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=800&auto=format&fit=crop&q=80' }))}
                  className="btn btn-secondary"
                  style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                >
                  🎭 Drama
                </button>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, poster_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80' }))}
                  className="btn btn-secondary"
                  style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                >
                  🏜️ Fantasy
                </button>
              </div>
            </div>

            {/* Poster Live Preview */}
            {formData.poster_url && (
              <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img
                  src={formData.poster_url}
                  alt="Poster Preview"
                  style={{ width: '45px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--primary)' }}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80';
                  }}
                />
                <span style={{ fontSize: '0.75rem', color: '#34d399' }}>✓ Poster Live Preview Ready</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">YouTube Trailer Video URL</label>
            <input
              type="url"
              name="trailer_url"
              className="form-input"
              value={formData.trailer_url}
              onChange={handleChange}
              placeholder="https://www.youtube.com/watch?v=..."
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
