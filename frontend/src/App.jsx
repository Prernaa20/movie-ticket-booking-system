import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

function App() {
  const { user } = useAuth();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Routes>
        <Route path="/" element={
          <div className="container page-section" style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>
              CinePass Movie Booking System
            </h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
              Phase 6 Design System & Core Architecture Initialized.
            </p>
            <div style={{ display: 'inline-flex', gap: '1rem' }}>
              <span className="badge badge-primary">React 18</span>
              <span className="badge badge-amber">Vite</span>
              <span className="badge badge-success">Glassmorphism</span>
            </div>
          </div>
        } />
      </Routes>
    </div>
  );
}

export default App;
