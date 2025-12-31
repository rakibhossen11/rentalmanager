'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import AdminNavbar from '../components/AdminNavbar';
import { AdminRoute } from '../components/ProtectedRoute';

export default function AdminLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    // Check if mobile
    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth < 1024); // lg breakpoint
        };
        
        checkIfMobile();
        window.addEventListener('resize', checkIfMobile);
        
        return () => window.removeEventListener('resize', checkIfMobile);
    }, []);

    // Close sidebar on mobile by default
    useEffect(() => {
        if (isMobile) {
            setSidebarOpen(false);
        } else {
            setSidebarOpen(true);
        }
    }, [isMobile]);

    return (
        <AdminRoute>
            <div className="min-h-screen bg-gray-100">
                {/* Fixed Navbar */}
                {/* <AdminNavbar 
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    isMobile={isMobile}
                /> */}
                
                <div className="flex pt-16"> {/* pt-16 for navbar height */}
                    {/* Fixed Sidebar */}
                    <AdminSidebar 
                        open={sidebarOpen}
                        setOpen={setSidebarOpen}
                        isMobile={isMobile}
                    />
                    
                    {/* Main Content */}
                    <main 
                        className={`flex-1 min-h-screen transition-all duration-300 ${
                            sidebarOpen && !isMobile ? 'lg:ml-64' : ''
                        }`}
                    >
                        <div className="p-4 md:p-6">
                            {children}
                        </div>
                    </main>

                    {/* Mobile Overlay */}
                    {sidebarOpen && isMobile && (
                        <div 
                            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        />
                    )}
                </div>
            </div>
        </AdminRoute>
    );
}

// 'use client';

// import { useState } from 'react';
// import AdminSidebar from '../components/AdminSidebar';
// import AdminNavbar from '../components/AdminNavbar';
// import { AdminRoute } from '../components/ProtectedRoute';

// export default function AdminLayout({ children }) {
//     const [sidebarOpen, setSidebarOpen] = useState(true);

//     return (
//         <AdminRoute>
//             <div className="min-h-screen bg-gray-50">
//                 <AdminNavbar 
//                     sidebarOpen={sidebarOpen}
//                     setSidebarOpen={setSidebarOpen}
//                 />
                
//                 <div className="flex">
//                     <AdminSidebar 
//                         open={sidebarOpen}
//                         setOpen={setSidebarOpen}
//                     />
                    
//                     <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : ''}`}>
//                         <div className="p-6">
//                             {children}
//                         </div>
//                     </main>
//                 </div>
//             </div>
//         </AdminRoute>
//     );
// }