import { useState, useEffect } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { skipWaiting } from '../lib/serviceWorker';

/**
 * Service Worker Update Notification
 * Shows when a new version of the app is available
 */
export default function UpdateNotification() {
    const [showUpdate, setShowUpdate] = useState(false);

    useEffect(() => {
        // Listen for service worker update event
        const handleUpdate = () => {
            setShowUpdate(true);
        };

        window.addEventListener('sw-update-available', handleUpdate);

        return () => {
            window.removeEventListener('sw-update-available', handleUpdate);
        };
    }, []);

    const handleUpdate = () => {
        skipWaiting();
        setShowUpdate(false);
    };

    const handleDismiss = () => {
        setShowUpdate(false);
    };

    if (!showUpdate) {
        return null;
    }

    return (
        <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-down">
            <div className="glass rounded-lg border border-white/10 shadow-2xl p-4">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                        <RefreshCw className="w-5 h-5 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-sm mb-1">
                            Update Available
                        </h3>
                        <p className="text-slate-300 text-xs mb-3">
                            A new version of NexusMind is available. Refresh to get the latest features and improvements.
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleUpdate}
                                className="btn-primary text-xs px-3 py-1.5"
                            >
                                Refresh Now
                            </button>
                            <button
                                onClick={handleDismiss}
                                className="btn-secondary text-xs px-3 py-1.5"
                            >
                                Later
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={handleDismiss}
                        className="flex-shrink-0 p-1 hover:bg-white/10 rounded transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-4 h-4 text-slate-400" />
                    </button>
                </div>
            </div>
        </div>
    );
}
