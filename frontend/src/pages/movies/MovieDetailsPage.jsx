import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Clock, Calendar, Globe, Ticket, Film, Play, ArrowLeft } from 'lucide-react';
import api from '../../services/api';

const MovieDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTrailerModal, setShowTrailerModal] = useState(false);

  useEffect(() => {
    fetchMovieAndShows();
  }, [id]);

  const fetchMovieAndShows = async () => {
    setLoading(true);
    try {
      const [movieRes, showsRes] = await Promise.all([
        api.get(`/movies/${id}`),
        api.get(`/shows/movie/${id}`),
      ]);
      setMovie(movieRes.data);
      setShows(showsRes.data);
    } catch (error) {
      console.error('Error fetching movie details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container page-section" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <Film size={40} color="var(--primary)" style={{ marginBottom: '1rem' }} />
        <div style={{ color: 'var(--text-muted)' }}>Loading movie & showtime details...</div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="container page-section" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <h2>Movie Not Found</h2>
        <button onClick={() => navigate('/')} className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Catalog
        </button>
      </div>
    );
  }

  const getEmbedTrailerUrl = (url) => {
    if (!url) return 'https://www.youtube.com/embed/zSWdZVtXT7E?autoplay=1';
    if (url.includes('embed/')) {
      return url.includes('autoplay=1') ? url : `${url}${url.includes('?') ? '&' : '?'}autoplay=1`;
    }
    let videoId = 'zSWdZVtXT7E';
    if (url.includes('v=')) {
      videoId = url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    }
    return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  };

  return (
    <div>
      {/* Hero Backdrop Header */}
      <div style={{
        position: 'relative',
        minHeight: '400px',
        display: 'flex',
        alignItems: 'flex-end',
        backgroundImage: `url(${movie.poster_url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center 30%',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(9, 13, 22, 0.4) 0%, rgba(9, 13, 22, 1) 100%)',
          backdropFilter: 'blur(8px)',
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 2, paddingBottom: '2.5rem', paddingTop: '3rem' }}>
          <button
            onClick={() => navigate('/')}
            className="btn btn-secondary"
            style={{ marginBottom: '1.5rem', padding: '6px 14px', fontSize: '0.85rem' }}
          >
            <ArrowLeft size={16} /> Back to Catalog
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2.5rem', alignItems: 'center' }}>
            {/* Poster Card */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <img
                src={movie.poster_url || 'https://images.unsplash.com/photo-1534447677768-be436bb09401'}
                alt={movie.title}
                style={{
                  width: '240px',
                  height: '350px',
                  objectFit: 'cover',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8)',
                  border: '2px solid rgba(255, 255, 255, 0.15)',
                }}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1534447677768-be436bb09401';
                }}
              />
            </div>

            {/* Overview Details */}
            <div style={{ gridColumn: 'span 2' }}>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '1rem' }}>
                <span className="badge badge-amber" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Star size={14} fill="#fbbf24" color="#fbbf24" /> {movie.rating.toFixed(1)} IMDb
                </span>
                <span className="badge badge-primary">{movie.language}</span>
                <span className="badge" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}>
                  <Clock size={12} style={{ marginRight: '4px' }} /> {movie.duration_mins} Minutes
                </span>
              </div>

              <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', marginBottom: '1rem' }}>
                {movie.title}
              </h1>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                {movie.genre.map((g, idx) => (
                  <span key={idx} style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-main)',
                    background: 'rgba(255, 255, 255, 0.08)',
                    padding: '4px 12px',
                    borderRadius: '50px',
                    border: '1px solid var(--border)',
                  }}>
                    {g}
                  </span>
                ))}
              </div>

              <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.7, maxWidth: '750px', marginBottom: '1.5rem' }}>
                {movie.description}
              </p>

              <button
                onClick={() => setShowTrailerModal(true)}
                className="btn btn-secondary"
                style={{ padding: '0.75rem 1.5rem' }}
              >
                <Play size={18} fill="var(--primary)" color="var(--primary)" /> Watch Official Trailer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Showtimes & Screen Section */}
      <div className="container page-section">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
          <Ticket size={28} color="var(--primary)" />
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff' }}>
              Select Showtime & Experience
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Choose screen, showtime, and ticket price to pick your preferred seats
            </p>
          </div>
        </div>

        {shows.length === 0 ? (
          <div className="card-glass" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Calendar size={40} color="rgba(255, 255, 255, 0.2)" style={{ marginBottom: '1rem' }} />
            <p>No showtimes scheduled for this movie currently.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {shows.map((show) => {
              const showDate = new Date(show.show_time);
              const formattedDate = showDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
              const formattedTime = showDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
              const availableSeats = show.total_seats - (show.booked_seats?.length || 0);

              return (
                <div key={show.id} className="card-glass" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="badge badge-amber" style={{ fontSize: '0.8rem' }}>
                      {show.screen_name}
                    </span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                      ${show.price_per_seat.toFixed(2)}
                    </span>
                  </div>

                  <div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
                      {formattedTime}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} /> {formattedDate}
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: availableSeats > 10 ? '#34d399' : '#fbbf24', fontWeight: 600 }}>
                      {availableSeats} / {show.total_seats} Seats Available
                    </span>
                    <button
                      onClick={() => navigate(`/booking/${show.id}`)}
                      className="btn btn-primary"
                      style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                    >
                      Select Seats
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Trailer Modal */}
      {showTrailerModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 10000,
          background: 'rgba(0, 0, 0, 0.94)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
        }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '800px', background: '#000', borderRadius: '16px', overflow: 'hidden' }}>
            <button
              onClick={() => setShowTrailerModal(false)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                zIndex: 10,
                background: 'rgba(0,0,0,0.7)',
                border: 'none',
                color: '#fff',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ✕
            </button>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
              <iframe
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                src={getEmbedTrailerUrl(movie.trailer_url)}
                title={`${movie.title} Trailer Preview`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetailsPage;
