import React, { useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';

const Signup = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE_URL}/api/auth/signup`, { username, password });
            setMessage('Registration successful! Please wait for admin approval.');
            setError('');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Signup failed');
            setMessage('');
        }
    };

    if (message) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="text-green-500 w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold font-heading text-slate-900 mb-2">Registration Complete</h2>
                    <p className="text-slate-500 mb-6">{message}</p>
                    <p className="text-sm text-slate-400">Redirecting to login...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-white">
            {/* Left Side - Image */}
            <div className="hidden md:block relative bg-slate-900">
                <div className="absolute inset-0 bg-[url('/assets/sambrani.webp')] bg-cover bg-center opacity-40"></div>
                <div className="relative z-10 h-full flex flex-col justify-between p-12 text-white">
                    <Link to="/" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
                        <ArrowLeft size={20} /> Back to Home
                    </Link>
                    <div>
                        <h2 className="text-4xl font-heading font-bold mb-4">Join Us Today</h2>
                        <p className="text-slate-300 max-w-md">Create an account to verify your business and start placing orders.</p>
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
                        <h1 className="text-3xl font-bold font-heading">Create Account</h1>
                    </div>

                    <div className="glass-panel p-8 md:p-10 rounded-2xl bg-white">
                        <h2 className="text-2xl font-bold font-heading mb-6 text-slate-900 hidden md:block">Create Account</h2>

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
                                    placeholder="Choose a username"
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
                                    placeholder="Create a password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="w-full btn-primary py-3 text-lg mt-2 shadow-lg shadow-green-900/10 bg-green-600 hover:bg-green-700">
                                Register
                            </button>

                            <p className="text-center text-slate-500 text-sm mt-6">
                                Already have an account? <Link to="/login" className="text-blue-600 font-semibold hover:underline">Log in</Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
