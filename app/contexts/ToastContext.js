// app/contexts/ToastContext.js
'use client';

import React, { createContext, useContext, useState } from 'react';

// Remove the incorrect import: import { Toast } from '';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const showBackendToast = () => {
    showToast('Backend integration is ongoing. Data is stored locally for now.', 'info');
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast, showBackendToast }}>
      {children}
      {/* Placeholder for toast UI - you can style this div later */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-2 rounded shadow ${
              toast.type === 'info' ? 'bg-blue-500 text-white' : 'bg-gray-800 text-white'
            }`}
          >
            {toast.message}
            <button onClick={() => removeToast(toast.id)} className="ml-3">×</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}