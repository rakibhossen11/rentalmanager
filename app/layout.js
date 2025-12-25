import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from './components/layout/Sidebar';
import { ToastProvider } from './contexts/ToastContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Rental Manager - Client Side Demo',
  description: 'A client-side rental management system',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ToastProvider>
          <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 overflow-auto">
              {children}
            </main>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}