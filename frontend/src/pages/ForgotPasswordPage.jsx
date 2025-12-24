import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://nexusmind.onrender.com';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });
            setEmailSent(true);
            toast.success('Password reset instructions sent to your email!');
        } catch (error) {
            const message = error.response?.data?.detail || 'Failed to send reset email';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    if (emailSent) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 safe-top safe-bottom">
                <div className="w-full max-w-md">
                    <div className="glass rounded-2xl shadow-2xl border border-white/10 p-6 sm:p-8 text-center">
                        <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-green-400 mx-auto mb-4" />
                        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Check Your Email</h2>
                        <p className="text-sm sm:text-base text-slate-400 mb-6">
                            We've sent password reset instructions to <strong className="text-white">{email}</strong>.
                            Please check your inbox and follow the link to reset your password.
                        </p>
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors text-sm sm:text-base"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Login
                        </Link>
                    </div>
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
                    <p className="text-sm sm:text-base text-slate-400">Reset Your Password</p>
                </div>

                {/* Reset Password Card */}
                <div className="glass rounded-2xl shadow-2xl border border-white/10 p-6 sm:p-8">
                    <div className="mb-6">
                        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Forgot Password?</h2>
                        <p className="text-sm text-slate-400">
                            Enter your email address and we'll send you instructions to reset your password.
                        </p>
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

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed touch-target text-sm sm:text-base mt-6"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Sending...</span>
                                </>
                            ) : (
                                <>
                                    <Mail className="w-5 h-5" />
                                    <span>Send Reset Link</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Back to Login Link */}
                    <div className="mt-6 pt-6 border-t border-white/10 text-center">
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors text-sm sm:text-base"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
