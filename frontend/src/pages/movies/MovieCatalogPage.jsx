import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, Film, X } from 'lucide-react';
import api from '../../services/api';
import MovieCard from '../../components/movies/MovieCard';
import HeroBanner from '../../components/movies/HeroBanner';

const GENRES = ['All', 'Sci-Fi', 'Action', 'Adventure', 'Biography', 'Drama', 'History', 'Thriller'];
const LANGUAGES = ['All Languages', 'English', 'Hindi', 'Spanish'];

const MovieCatalogPage = () => {
  const [movies, setMovies] = useState([]);
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All Languages');
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMovies, setTotalMovies] = useState(0);

  useEffect(() => {
    fetchMovies();
  }, [search, selectedGenre, selectedLanguage, page]);

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 8 };
      if (search.trim()) params.search = search.trim();
      if (selectedGenre !== 'All') params.genre = selectedGenre;
      if (selectedLanguage !== 'All Languages') params.language = selectedLanguage;

      const response = await api.get('/movies', { params });
      const data = response.data;
      
      setMovies(data.items);
      setTotalPages(data.total_pages);
      setTotalMovies(data.total);

      if (!featuredMovie && data.items.length > 0) {
        setFeaturedMovie(data.items[0]);
      }
    } catch (error) {
      console.error('Error fetching movie catalog:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenreSelect = (genre) => {
    setSelectedGenre(genre);
    setPage(1);
  };

  const handleLanguageSelect = (e) => {
    setSelectedLanguage(e.target.value);
    setPage(1);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div className="container page-section">
      {/* Featured Blockbuster Hero */}
      {featuredMovie && <HeroBanner movie={featuredMovie} />}

      {/* Search & Filter Toolbar */}
      <div className="card-glass" style={{ padding: '1.5rem', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Top Bar: Search Input & Language Selector */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Live Search Input */}
            <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
              <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '44px', paddingRight: '36px' }}
                placeholder="Search movies by title..."
                value={search}
                onChange={handleSearchChange}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Language Selector */}
            <select
              value={selectedLanguage}
              onChange={handleLanguageSelect}
              className="form-input"
              style={{ width: 'auto', minWidth: '160px', cursor: 'pointer' }}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang} style={{ background: 'var(--bg-surface)', color: '#fff' }}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          {/* Genre Pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginRight: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Filter size={14} /> Genre:
            </span>
            {GENRES.map((genre) => (
              <button
                key={genre}
                onClick={() => handleGenreSelect(genre)}
                style={{
                  background: selectedGenre === genre ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                  color: selectedGenre === genre ? '#fff' : 'var(--text-muted)',
                  border: `1px solid ${selectedGenre === genre ? 'var(--primary)' : 'var(--border)'}`,
                  padding: '6px 14px',
                  borderRadius: '50px',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {genre}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Catalog Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff' }}>
          Now Showing
        </h2>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Showing {movies.length} of {totalMovies} Movies
        </span>
      </div>

      {/* Movie Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
          <Film size={40} color="var(--primary)" style={{ marginBottom: '1rem' }} />
          <div>Loading movie catalog...</div>
        </div>
      ) : movies.length === 0 ? (
        <div className="card-glass" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Film size={48} color="rgba(255, 255, 255, 0.2)" style={{ marginBottom: '1rem' }} />
          <h3>No movies found</h3>
          <p style={{ marginTop: '0.5rem' }}>Try clearing your search or changing selected genre filters.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '1.75rem',
          marginBottom: '3rem',
        }}>
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="btn btn-secondary"
            style={{ padding: '8px 16px', opacity: page === 1 ? 0.5 : 1 }}
          >
            <ChevronLeft size={16} /> Previous
          </button>

          <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            className="btn btn-secondary"
            style={{ padding: '8px 16px', opacity: page === totalPages ? 0.5 : 1 }}
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default MovieCatalogPage;
