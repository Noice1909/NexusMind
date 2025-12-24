import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, Loader2, CheckCircle, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://nexusmind.onrender.com';

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (!token) {
            toast.error('Invalid reset link');
            return;
        }

        setLoading(true);

        try {
            await axios.post(`${API_BASE_URL}/auth/reset-password`, {
                token,
                new_password: password,
            });
            setSuccess(true);
            toast.success('Password reset successfully!');
            setTimeout(() => navigate('/login'), 3000);
        } catch (error) {
            const message = error.response?.data?.detail || 'Failed to reset password';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 safe-top safe-bottom">
                <div className="glass rounded-2xl shadow-2xl border border-white/10 p-6 sm:p-8 text-center max-w-md">
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Invalid Reset Link</h2>
                    <p className="text-sm sm:text-base text-slate-400 mb-6">
                        This password reset link is invalid or has expired.
                    </p>
                    <Link to="/forgot-password" className="btn-primary inline-block text-sm sm:text-base">
                        Request New Link
                    </Link>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 safe-top safe-bottom">
                <div className="glass rounded-2xl shadow-2xl border border-white/10 p-6 sm:p-8 text-center max-w-md">
                    <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-green-400 mx-auto mb-4" />
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Password Reset Complete!</h2>
                    <p className="text-sm sm:text-base text-slate-400 mb-6">
                        Your password has been successfully reset. Redirecting to login...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 safe-top safe-bottom">
            <div className="w-full max-w-md">
                {/* Logo/Brand */}
                <div className="text-center mb-6 sm:mb-8">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-primary-400" />
                        <h1 className="text-3xl sm:text-4xl font-bold gradient-text">NexusMind</h1>
                    </div>
                    <p className="text-sm sm:text-base text-slate-400">Create New Password</p>
                </div>

                {/* Reset Password Card */}
                <div className="glass rounded-2xl shadow-2xl border border-white/10 p-6 sm:p-8">
                    <div className="mb-6">
                        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Reset Password</h2>
                        <p className="text-sm text-slate-400">
                            Enter your new password below.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                        {/* New Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                                New Password
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
                            <p className="mt-1 text-xs text-slate-500">Minimum 8 characters</p>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    minLength={8}
                                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent touch-target text-sm sm:text-base transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
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
                                    <span>Resetting...</span>
                                </>
                            ) : (
                                <>
                                    <Lock className="w-5 h-5" />
                                    <span>Reset Password</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
