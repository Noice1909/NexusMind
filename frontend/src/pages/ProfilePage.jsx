import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Save, ArrowLeft, Loader2, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://nexusmind.onrender.com';

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);

    // Profile form
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');

    // Password change form
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        if (user) {
            setFullName(user.full_name || '');
            setEmail(user.email || '');
        }
    }, [user]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();

        if (!fullName.trim()) {
            toast.error('Full name is required');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            await axios.put(
                `${API_BASE_URL}/auth/profile`,
                { full_name: fullName },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success('Profile updated successfully!');
        } catch (error) {
            const message = error.response?.data?.detail || 'Failed to update profile';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (newPassword.length < 8) {
            toast.error('New password must be at least 8 characters');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setPasswordLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            await axios.post(
                `${API_BASE_URL}/auth/change-password`,
                {
                    current_password: currentPassword,
                    new_password: newPassword,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success('Password changed successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            const message = error.response?.data?.detail || 'Failed to change password';
            toast.error(message);
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-blue-600 p-4">
            <div className="max-w-4xl mx-auto py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-white hover:text-purple-200 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Dashboard
                    </button>
                    <button
                        onClick={logout}
                        className="btn-secondary"
                    >
                        Logout
                    </button>
                </div>

                <div className="glass rounded-2xl shadow-2xl border border-white/20 p-8">
                    <div className="flex items-center gap-3 mb-8">
                        <User className="w-8 h-8 text-purple-300" />
                        <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Profile Information */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 mb-4">
                                <User className="w-5 h-5 text-purple-300" />
                                <h2 className="text-xl font-semibold text-white">Profile Information</h2>
                            </div>

                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                {/* Full Name */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                                        placeholder="Your full name"
                                    />
                                </div>

                                {/* Email (Read-only) */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-300" />
                                        <input
                                            type="email"
                                            value={email}
                                            disabled
                                            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-slate-300 cursor-not-allowed"
                                        />
                                    </div>
                                    <p className="text-xs text-purple-200 mt-1">
                                        Email cannot be changed
                                    </p>
                                </div>

                                {/* Save Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-white text-purple-600 font-semibold py-3 px-4 rounded-lg hover:bg-purple-50 transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Change Password */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Shield className="w-5 h-5 text-purple-300" />
                                <h2 className="text-xl font-semibold text-white">Change Password</h2>
                            </div>

                            <form onSubmit={handleChangePassword} className="space-y-4">
                                {/* Current Password */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        Current Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-300" />
                                        <input
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                {/* New Password */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-300" />
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            minLength={8}
                                            className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        Confirm New Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-300" />
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            minLength={8}
                                            className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                {/* Change Password Button */}
                                <button
                                    type="submit"
                                    disabled={passwordLoading}
                                    className="w-full bg-purple-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-purple-600 transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {passwordLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Changing...
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="w-5 h-5" />
                                            Change Password
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
