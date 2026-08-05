import React, { createContext, useContext, useState } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast: addToast }}>
      {children}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '380px',
      }}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '10px',
              background: 'rgba(18, 24, 38, 0.95)',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${
                toast.type === 'success' ? 'rgba(52, 211, 153, 0.4)' :
                toast.type === 'error' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(59, 130, 246, 0.4)'
              }`,
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
              color: '#fff',
              fontSize: '0.9rem',
              animation: 'slideIn 0.3s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {toast.type === 'success' && <CheckCircle size={18} color="#34d399" />}
              {toast.type === 'error' && <AlertCircle size={18} color="#ef4444" />}
              {toast.type === 'info' && <Info size={18} color="#60a5fa" />}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
