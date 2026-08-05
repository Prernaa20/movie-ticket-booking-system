import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProfilePage from './pages/auth/ProfilePage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

function App() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={
            <div className="container page-section" style={{ textAlign: 'center' }}>
              <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>
                CinePass Movie Booking System
              </h1>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                Authentication pages, Protected Routes, Navigation Bar & User Profile loaded cleanly.
              </p>
              <div style={{ display: 'inline-flex', gap: '1rem' }}>
                <span className="badge badge-primary">JWT Auth</span>
                <span className="badge badge-amber">Role-Based Access</span>
                <span className="badge badge-success">Protected Routes</span>
              </div>
            </div>
          } />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/my-bookings" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
