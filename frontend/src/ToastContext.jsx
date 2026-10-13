import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [dialog, setDialog] = useState(null); // { message, title, type: 'alert' | 'confirm', onConfirm, onCancel }

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const showAlert = useCallback((message, title = 'Notice') => {
    return new Promise((resolve) => {
      setDialog({
        title,
        message,
        type: 'alert',
        onConfirm: () => {
          setDialog(null);
          resolve(true);
        }
      });
    });
  }, []);

  const showConfirm = useCallback((message, title = 'Confirm Action') => {
    return new Promise((resolve) => {
      setDialog({
        title,
        message,
        type: 'confirm',
        onConfirm: () => {
          setDialog(null);
          resolve(true);
        },
        onCancel: () => {
          setDialog(null);
          resolve(false);
        }
      });
    });
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, showAlert, showConfirm }}>
      {children}

      {/* In-app Toast Notifications Container */}
      <div className="app-toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`app-toast app-toast-${toast.type}`}>
            <div className="app-toast-icon">
              {toast.type === 'success' && '✓'}
              {toast.type === 'error' && '✕'}
              {toast.type === 'warning' && '⚠'}
              {toast.type === 'info' && 'ℹ'}
            </div>
            <div className="app-toast-content">{toast.message}</div>
            <button className="app-toast-close" onClick={() => removeToast(toast.id)}>✕</button>
          </div>
        ))}
      </div>

      {/* In-app Modal Dialog (Alert / Confirm) */}
      {dialog && (
        <div className="app-dialog-backdrop">
          <div className="app-dialog-box animate-scale-up">
            <div className="app-dialog-header">
              <div className={`app-dialog-icon app-dialog-icon-${dialog.type}`}>
                {dialog.type === 'confirm' ? '❓' : '⚠️'}
              </div>
              <h3 className="app-dialog-title">{dialog.title}</h3>
            </div>
            <div className="app-dialog-body">
              <p>{dialog.message}</p>
            </div>
            <div className="app-dialog-footer">
              {dialog.type === 'confirm' && (
                <button
                  type="button"
                  className="app-dialog-btn app-dialog-btn-secondary"
                  onClick={dialog.onCancel}
                >
                  Cancel
                </button>
              )}
              <button
                type="button"
                className="app-dialog-btn app-dialog-btn-primary"
                onClick={dialog.onConfirm}
                autoFocus
              >
                {dialog.type === 'confirm' ? 'Confirm' : 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
