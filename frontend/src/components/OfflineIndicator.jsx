import { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

/**
 * Offline Indicator Component
 * Shows when the app is offline
 */
export default function OfflineIndicator() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [showOffline, setShowOffline] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            setShowOffline(false);
        };

        const handleOffline = () => {
            setIsOnline(false);
            setShowOffline(true);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Auto-hide after coming back online
    useEffect(() => {
        if (isOnline && showOffline) {
            const timer = setTimeout(() => {
                setShowOffline(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isOnline, showOffline]);

    if (!showOffline && isOnline) {
        return null;
    }

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-auto md:left-1/2 md:-translate-x-1/2 md:w-auto z-50 animate-slide-up">
            <div className={`glass rounded-lg border shadow-2xl px-4 py-3 flex items-center gap-3 ${isOnline
                    ? 'border-green-500/30 bg-green-500/10'
                    : 'border-red-500/30 bg-red-500/10'
                }`}>
                {isOnline ? (
                    <>
                        <Wifi className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="text-white font-semibold text-sm">
                                Back Online
                            </p>
                            <p className="text-slate-300 text-xs">
                                Your changes will now sync automatically
                            </p>
                        </div>
                    </>
                ) : (
                    <>
                        <WifiOff className="w-5 h-5 text-red-400 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="text-white font-semibold text-sm">
                                You're Offline
                            </p>
                            <p className="text-slate-300 text-xs">
                                Changes will sync when you're back online
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
