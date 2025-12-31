// components/ToastProvider.js - Simple wrapper if needed
'use client';

import { Toaster } from 'react-hot-toast';

export default function ToastProvider({ children }) {
  return (
    <>
      {children}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  );
}

// Then use it anywhere by importing toast from react-hot-toast
import toast from 'react-hot-toast';

// In your components:
toast.success('Success message!');
toast.error('Error message!');
toast.loading('Loading...');

// 'use client';

// import { createContext, useContext } from 'react';
// import toast from 'react-hot-toast';

// const ToastContext = createContext({});

// export default function ToastProvider({ children }) {
//     const showToast = (message, type = 'success') => {
//         switch (type) {
//             case 'success':
//                 toast.success(message);
//                 break;
//             case 'error':
//                 toast.error(message);
//                 break;
//             case 'warning':
//                 toast(message, { icon: '⚠️' });
//                 break;
//             case 'info':
//                 toast(message, { icon: 'ℹ️' });
//                 break;
//             default:
//                 toast(message);
//         }
//     };

//     const showLoadingToast = (message) => {
//         return toast.loading(message);
//     };

//     const updateToast = (id, message, type = 'success') => {
//         switch (type) {
//             case 'success':
//                 toast.success(message, { id });
//                 break;
//             case 'error':
//                 toast.error(message, { id });
//                 break;
//             default:
//                 toast(message, { id });
//         }
//     };

//     const dismissToast = (id) => {
//         toast.dismiss(id);
//     };

//     return (
//         <ToastContext.Provider value={{
//             showToast,
//             showLoadingToast,
//             updateToast,
//             dismissToast
//         }}>
//             {children}
//         </ToastContext.Provider>
//     );
// }

// export const useToast = () => useContext(ToastContext);