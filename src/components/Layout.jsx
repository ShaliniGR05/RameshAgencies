import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar />
            <main className="flex-grow pt-20">
                {children}
            </main>
            <footer className="bg-slate-900 text-slate-400 py-12">
                <div className="container mx-auto px-6 text-center">
                    <h3 className="text-white text-xl font-heading font-bold mb-4">Ramesh Agencies</h3>
                    <p className="mb-8 max-w-md mx-auto">Premium Pooja items and decor for your spiritual journey. Quality authenticity you can trust.</p>
                    <p className="text-sm">&copy; {new Date().getFullYear()} Ramesh Agencies. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
