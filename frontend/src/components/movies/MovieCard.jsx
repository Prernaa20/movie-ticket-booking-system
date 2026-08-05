import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Clock, Globe, Ticket } from 'lucide-react';

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();

  return (
    <div
      className="card-glass"
      style={{
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        cursor: 'pointer',
      }}
      onClick={() => navigate(`/movie/${movie.id}`)}
    >
      {/* Poster Container with Rating Overlay */}
      <div style={{ position: 'relative', overflow: 'hidden', height: '320px' }}>
        <img
          src={movie.poster_url || 'https://images.unsplash.com/photo-1534447677768-be436bb09401'}
          alt={movie.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
        />
        
        {/* Rating Badge */}
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'rgba(9, 13, 22, 0.85)',
          backdropFilter: 'blur(8px)',
          border: '1px solid var(--border)',
          borderRadius: '50px',
          padding: '4px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '0.8rem',
          fontWeight: 700,
          color: '#fbbf24',
        }}>
          <Star size={14} fill="#fbbf24" color="#fbbf24" />
          {movie.rating.toFixed(1)}
        </div>

        {/* Language Badge */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          background: 'rgba(229, 9, 20, 0.9)',
          backdropFilter: 'blur(8px)',
          borderRadius: '4px',
          padding: '2px 8px',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: '#fff',
          textTransform: 'uppercase',
        }}>
          {movie.language}
        </div>
      </div>

      {/* Movie Details Body */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3 style={{
          fontSize: '1.15rem',
          fontWeight: 700,
          color: '#fff',
          marginBottom: '0.5rem',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {movie.title}
        </h3>

        {/* Genres */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {movie.genre.slice(0, 2).map((g, idx) => (
            <span key={idx} style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '2px 8px',
              borderRadius: '4px',
              border: '1px solid var(--border)',
            }}>
              {g}
            </span>
          ))}
          {movie.duration_mins && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '2px' }}>
              <Clock size={12} /> {movie.duration_mins}m
            </span>
          )}
        </div>

        <button
          className="btn btn-secondary"
          style={{ width: '100%', marginTop: 'auto', fontSize: '0.85rem', padding: '0.65rem' }}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/movie/${movie.id}`);
          }}
        >
          <Ticket size={14} /> View Showtimes
        </button>
      </div>
    </div>
  );
};

export default MovieCard;
