import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock, Loader2, Sparkles } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const result = await login(email, password);

        if (result.success) {
            navigate('/');
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 safe-top safe-bottom">
            <div className="w-full max-w-md">
                {/* Logo/Brand */}
                <div className="text-center mb-6 sm:mb-8">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-primary-400" />
                        <h1 className="text-3xl sm:text-4xl font-bold gradient-text">NexusMind</h1>
                    </div>
                    <p className="text-sm sm:text-base text-slate-400">AI-Powered Note Taking</p>
                </div>

                {/* Login Card */}
                <div className="glass rounded-2xl shadow-2xl border border-white/10 p-6 sm:p-8">
                    <div className="flex items-center gap-2 mb-6">
                        <LogIn className="w-5 h-5 sm:w-6 sm:h-6 text-primary-400" />
                        <h2 className="text-xl sm:text-2xl font-bold text-white">Welcome Back</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                        {/* Email Input */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent touch-target text-sm sm:text-base transition-all"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={8}
                                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent touch-target text-sm sm:text-base transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {/* Forgot Password Link */}
                        <div className="text-right">
                            <Link to="/forgot-password" className="text-sm text-primary-400 hover:text-primary-300 transition-colors">
                                Forgot password?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed touch-target text-sm sm:text-base mt-6"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Logging in...</span>
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" />
                                    <span>Log In</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Signup Link */}
                    <div className="mt-6 pt-6 border-t border-white/10 text-center">
                        <p className="text-sm sm:text-base text-slate-400">
                            Don't have an account?{' '}
                            <Link to="/signup" className="text-primary-400 font-semibold hover:text-primary-300 transition-colors">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 sm:mt-8 text-center text-slate-500 text-xs sm:text-sm">
                    <p>🔒 Secure authentication with JWT tokens</p>
                </div>
            </div>
        </div>
    );
}
