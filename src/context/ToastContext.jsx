import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

const ToastContainer = ({ toasts, onRemove }) => (
  <div className="toast-container" aria-live="polite" aria-atomic="true">
    {toasts.map(t => (
      <div key={t.id} className={`toast toast-${t.type}`} role="alert">
        <span className="toast-icon">
          {t.type === 'success' && '✓'}
          {t.type === 'error'   && '✕'}
          {t.type === 'info'    && 'ℹ'}
          {t.type === 'warning' && '⚠'}
        </span>
        <span className="toast-message">{t.message}</span>
        <button className="toast-close" onClick={() => onRemove(t.id)} aria-label="Dismiss notification">×</button>
      </div>
    ))}
  </div>
);
