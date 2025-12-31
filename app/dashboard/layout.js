// app/dashboard/layout.js
'use client'; // Add this if you're using client components

import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import AuthProvider from '../components/AuthProvider';
import SideNav from '../components/SideNav';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const inter = Inter({ subsets: ['latin'] });

export default function DashboardLayout({ children }) {
  return (
    // REMOVE the <html> and <body> tags here!
    // Just return the content directly
    
    <div className={inter.className}> {/* Add font class to a div */}
      <AuthProvider>
        <div className="flex min-h-screen bg-gray-50">
          <SideNav />
          <div className="flex-1 flex flex-col">
            <Navbar />
            <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </main>
            {/* <Footer /> */}
          </div>
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
    </div>
  );
}


// import { Inter } from 'next/font/google';
// import '../globals.css';
// import { Toaster } from 'react-hot-toast';
// import AuthProvider from '../components/AuthProvider';
// import SideNav from '../components/SideNav';
// import Navbar from '../components/Navbar';

// const inter = Inter({ subsets: ['latin'] });

// export const metadata = {
//   title: 'User Dashboard',
//   description: 'User dashboard for property management',
// };

// export default function UserLayout({ children }) {
//   return (
//     <html lang="en">
//       <body className={`${inter.className} bg-gray-50`}>
//         <AuthProvider>
//           <div className="flex min-h-screen">
//             <SideNav />
//             <div className="flex-1 flex flex-col">
//               <Navbar />
//               <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
//                 <div className="max-w-7xl mx-auto">
//                   {children}
//                 </div>
//               </main>
//             </div>
//           </div>
//         </AuthProvider>
        
//         <Toaster 
//           position="top-right"
//           toastOptions={{
//             duration: 4000,
//             style: {
//               background: '#363636',
//               color: '#fff',
//             },
//             success: {
//               duration: 3000,
//               iconTheme: {
//                 primary: '#10b981',
//                 secondary: '#fff',
//               },
//             },
//             error: {
//               duration: 4000,
//               iconTheme: {
//                 primary: '#ef4444',
//                 secondary: '#fff',
//               },
//             },
//           }}
//         />
//       </body>
//     </html>
//   );
// }