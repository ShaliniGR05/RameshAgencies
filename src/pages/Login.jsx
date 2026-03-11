import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', { username, password });
            login(res.data.token, res.data.username);
            if (res.data.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-white">
            {/* Left Side - Image */}
            <div className="hidden md:block relative bg-slate-900">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center opacity-40"></div>
                <div className="relative z-10 h-full flex flex-col justify-between p-12 text-white">
                    <Link to="/" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
                        <ArrowLeft size={20} /> Back to Home
                    </Link>
                    <div>
                        <h2 className="text-4xl font-heading font-bold mb-4">Welcome Back</h2>
                        <p className="text-slate-300 max-w-md">Access your dashboard to manage orders and view exclusive products.</p>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex items-center justify-center p-8 md:p-12 bg-slate-50">
                <div className="w-full max-w-md">
                    <div className="text-center mb-10 md:hidden">
                        <Link to="/" className="inline-flex items-center gap-2 text-slate-500 mb-8">
                            <ArrowLeft size={16} /> Back to Home
                        </Link>
                        <h1 className="text-3xl font-bold font-heading">Login</h1>
                    </div>

                    <div className="glass-panel p-8 md:p-10 rounded-2xl bg-white">
                        <h2 className="text-2xl font-bold font-heading mb-6 text-slate-900 hidden md:block">Sign In</h2>

                        {error && (
                            <div className="mb-6 bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2 border border-red-100">
                                <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-slate-700 text-sm font-semibold mb-2 ml-1">Username</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-slate-700 text-sm font-semibold mb-2 ml-1">Password</label>
                                <input
                                    type="password"
                                    className="input-field"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="w-full btn-primary py-3 text-lg mt-2 shadow-lg shadow-slate-900/10">
                                Sign In
                            </button>

                            <p className="text-center text-slate-500 text-sm mt-6">
                                Don't have an account? <Link to="/signup" className="text-blue-600 font-semibold hover:underline">Get started</Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
