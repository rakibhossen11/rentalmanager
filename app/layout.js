import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import AuthProvider from './components/AuthProvider';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Rental Manager Pro - Professional Property Management Software',
  description: 'Streamline your rental business with our all-in-one property management software. Manage tenants, properties, payments, and maintenance in one place.',
  keywords: 'property management, rental software, landlord tools, tenant management, rent collection',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </AuthProvider>
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
      </body>
    </html>
  );
}

// import { Inter } from 'next/font/google';
// import './globals.css';
// import Sidebar from './components/layout/Sidebar';
// import { ToastProvider } from './contexts/ToastContext';

// const inter = Inter({ subsets: ['latin'] });

// export const metadata = {
//   title: 'Rental Manager - Client Side Demo',
//   description: 'A client-side rental management system',
// };

// export default function RootLayout({ children }) {
//   return (
//     <html lang="en">
//       <body className={inter.className}>
//         <ToastProvider>
//           <div className="flex min-h-screen bg-gray-50">
//             <Sidebar />
//             <main className="flex-1 overflow-auto">
//               {children}
//             </main>
//           </div>
//         </ToastProvider>
//       </body>
//     </html>
//   );
// }