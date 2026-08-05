import React from 'react';
import { Star, Clock, Globe, Ticket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HeroBanner = ({ movie }) => {
  const navigate = useNavigate();

  if (!movie) return null;

  return (
    <div style={{
      position: 'relative',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      marginBottom: '3rem',
      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
      border: '1px solid var(--border)',
    }}>
      {/* Background Image with Dark Gradient Overlays */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `url(${movie.poster_url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center 20%',
        filter: 'blur(10px) brightness(0.35)',
        transform: 'scale(1.1)',
      }} />

      {/* Content Grid */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        padding: '3.5rem 2.5rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '2.5rem',
        alignItems: 'center',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <span className="badge badge-amber" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Star size={14} fill="#fbbf24" color="#fbbf24" /> {movie.rating.toFixed(1)} IMDb
            </span>
            <span className="badge badge-primary">Featured Release</span>
            <span className="badge" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}>
              <Clock size={12} style={{ marginRight: '4px' }} /> {movie.duration_mins} Mins
            </span>
          </div>

          <h1 style={{
            fontSize: 'calc(1.8rem + 1.5vw)',
            fontWeight: 800,
            color: '#fff',
            lineHeight: 1.15,
            marginBottom: '1rem',
            textShadow: '0 4px 20px rgba(0,0,0,0.8)',
          }}>
            {movie.title}
          </h1>

          <p style={{
            color: 'var(--text-muted)',
            fontSize: '1rem',
            lineHeight: 1.6,
            marginBottom: '1.75rem',
            maxWidth: '650px',
          }}>
            {movie.description}
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate(`/movie/${movie.id}`)}
              className="btn btn-primary"
              style={{ padding: '0.85rem 1.8rem', fontSize: '1rem' }}
            >
              <Ticket size={20} /> Book Tickets Now
            </button>
          </div>
        </div>

        {/* Poster Showcase */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <img
            src={movie.poster_url}
            alt={movie.title}
            style={{
              width: '240px',
              height: '340px',
              objectFit: 'cover',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 15px 35px rgba(0, 0, 0, 0.8)',
              border: '2px solid rgba(255, 255, 255, 0.15)',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
