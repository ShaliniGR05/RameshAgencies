import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, User, LogOut, Menu } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const isHome = location.pathname === '/';

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isHome ? 'bg-white/80 backdrop-blur-md border-b border-white/20' : 'bg-white shadow-sm'}`}>
            <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                <Link to="/" className="text-2xl font-bold font-heading tracking-tight flex items-center gap-2">
                    <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white text-lg">R</div>
                    <span>Ramesh<span className="text-slate-500">Agencies</span></span>
                </Link>

                <div className="flex items-center gap-6">
                    {!user ? (
                        <>
                            <Link to="/login" className="text-slate-600 font-medium hover:text-slate-900 transition-colors">Login</Link>
                            <Link to="/signup" className="btn-primary">Get Started</Link>
                        </>
                    ) : (
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-slate-500 hidden md:block">Welcome, {user.username}</span>
                            {user.role === 'admin' ? (
                                <div className="flex items-center gap-3">
                                    <Link to="/" className="text-slate-600 font-medium hover:text-slate-900 transition-colors text-sm">Home</Link>
                                    <Link to="/admin" className="btn-secondary text-sm">Dashboard</Link>
                                </div>
                            ) : (
                                <Link to="/dashboard" className="btn-secondary text-sm flex items-center gap-2">
                                    <ShoppingBag size={18} />
                                    <span>Shop</span>
                                </Link>
                            )}
                            <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Logout">
                                <LogOut size={20} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
