import React from 'react';
import { Film, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{
      background: 'var(--bg-surface)',
      borderTop: '1px solid var(--border)',
      padding: '3rem 0 2rem 0',
      marginTop: 'auto',
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2.5rem',
          marginBottom: '2.5rem',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
              <div style={{
                background: 'var(--primary)',
                padding: '6px',
                borderRadius: '8px',
                display: 'flex',
              }}>
                <Film size={20} color="#fff" />
              </div>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700 }}>
                Cine<span style={{ color: 'var(--primary)' }}>Pass</span>
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              A premium, full-stack Movie Ticket Booking System built with FastAPI, MongoDB Atlas, React, and modern CSS.
            </p>
          </div>

          <div>
            <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '1rem' }}>Technology Stack</h4>
            <ul style={{ listStyle: 'none', color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 2 }}>
              <li>FastAPI (Python 3.10)</li>
              <li>MongoDB Atlas (Motor Async ODM)</li>
              <li>React 18 & Vite</li>
              <li>JWT Authentication & Bcrypt</li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '1rem' }}>System Status</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', fontSize: '0.9rem' }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#34d399',
                boxShadow: '0 0 10px #34d399',
              }}></span>
              API Online & Connected to MongoDB Atlas
            </div>
            <p style={{ color: 'var(--text-subtle)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
              College Senior Full-Stack Development Submission Project.
            </p>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid var(--border)',
          paddingTop: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
        }}>
          <div>© {new Date().getFullYear()} CinePass. All rights reserved.</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            Built with <Heart size={14} color="var(--primary)" fill="var(--primary)" /> for Senior College Capstone Project
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
