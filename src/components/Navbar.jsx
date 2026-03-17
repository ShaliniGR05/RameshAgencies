import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, LogOut, Menu, X } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const isHome = location.pathname === '/';
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        setMenuOpen(false);
        navigate('/');
    };

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isHome ? 'bg-white/80 backdrop-blur-md border-b border-white/20' : 'bg-white shadow-sm'}`}>
            <div className="container mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="text-xl sm:text-2xl font-bold font-heading tracking-tight flex items-center gap-2" onClick={() => setMenuOpen(false)}>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white text-base sm:text-lg">R</div>
                    <span>Ramesh<span className="text-slate-500">Agencies</span></span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-6">
                    {!user ? (
                        <>
                            <Link to="/login" className="text-slate-600 font-medium hover:text-slate-900 transition-colors">Login</Link>
                            <Link to="/signup" className="btn-primary">Get Started</Link>
                        </>
                    ) : (
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-slate-500">Welcome, {user.username}</span>
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

                {/* Mobile Hamburger */}
                <button
                    className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                    onClick={() => setMenuOpen(prev => !prev)}
                    aria-label="Toggle menu"
                >
                    {menuOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            {/* Mobile Dropdown Menu */}
            {menuOpen && (
                <div className="md:hidden bg-white border-t border-slate-100 shadow-lg px-4 py-4 space-y-3 animate-slideDown">
                    {!user ? (
                        <>
                            <Link to="/login" onClick={() => setMenuOpen(false)} className="block w-full text-center py-2.5 text-slate-700 font-medium hover:text-slate-900 border border-slate-200 rounded-lg transition-colors">Login</Link>
                            <Link to="/signup" onClick={() => setMenuOpen(false)} className="block w-full text-center py-2.5 btn-primary rounded-lg">Get Started</Link>
                        </>
                    ) : (
                        <>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">Welcome, {user.username}</p>
                            {user.role === 'admin' ? (
                                <>
                                    <Link to="/" onClick={() => setMenuOpen(false)} className="block py-2.5 px-3 text-slate-700 font-medium hover:bg-slate-50 rounded-lg transition-colors">Home</Link>
                                    <Link to="/admin" onClick={() => setMenuOpen(false)} className="block py-2.5 px-3 text-slate-700 font-medium hover:bg-slate-50 rounded-lg transition-colors">Admin Dashboard</Link>
                                </>
                            ) : (
                                <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 py-2.5 px-3 text-slate-700 font-medium hover:bg-slate-50 rounded-lg transition-colors">
                                    <ShoppingBag size={18} /> Shop
                                </Link>
                            )}
                            <button onClick={handleLogout} className="w-full flex items-center gap-2 py-2.5 px-3 text-red-500 font-medium hover:bg-red-50 rounded-lg transition-colors">
                                <LogOut size={18} /> Logout
                            </button>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
