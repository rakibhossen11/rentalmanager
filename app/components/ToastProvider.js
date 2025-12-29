'use client';

import { createContext, useContext } from 'react';
import toast from 'react-hot-toast';

const ToastContext = createContext({});

export default function ToastProvider({ children }) {
    const showToast = (message, type = 'success') => {
        switch (type) {
            case 'success':
                toast.success(message);
                break;
            case 'error':
                toast.error(message);
                break;
            case 'warning':
                toast(message, { icon: '⚠️' });
                break;
            case 'info':
                toast(message, { icon: 'ℹ️' });
                break;
            default:
                toast(message);
        }
    };

    const showLoadingToast = (message) => {
        return toast.loading(message);
    };

    const updateToast = (id, message, type = 'success') => {
        switch (type) {
            case 'success':
                toast.success(message, { id });
                break;
            case 'error':
                toast.error(message, { id });
                break;
            default:
                toast(message, { id });
        }
    };

    const dismissToast = (id) => {
        toast.dismiss(id);
    };

    return (
        <ToastContext.Provider value={{
            showToast,
            showLoadingToast,
            updateToast,
            dismissToast
        }}>
            {children}
        </ToastContext.Provider>
    );
}

export const useToast = () => useContext(ToastContext);