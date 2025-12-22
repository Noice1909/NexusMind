/**
 * Service Worker Registration and Management
 */

/**
 * Register the service worker
 */
export async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/',
            });

            console.log('[SW] Service Worker registered:', registration.scope);

            // Check for updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                console.log('[SW] New service worker found');

                newWorker?.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // New service worker available
                        console.log('[SW] New content available, please refresh');
                        showUpdateNotification();
                    }
                });
            });

            // Handle controller change
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                console.log('[SW] Controller changed, reloading page');
                window.location.reload();
            });

            return registration;
        } catch (error) {
            console.error('[SW] Registration failed:', error);
            return null;
        }
    } else {
        console.log('[SW] Service workers not supported');
        return null;
    }
}

/**
 * Unregister the service worker
 */
export async function unregisterServiceWorker() {
    if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        await registration.unregister();
        console.log('[SW] Service Worker unregistered');
    }
}

/**
 * Check if service worker is registered
 */
export function isServiceWorkerRegistered() {
    return 'serviceWorker' in navigator && navigator.serviceWorker.controller !== null;
}

/**
 * Show update notification to user
 */
function showUpdateNotification() {
    // Create custom event for app to handle
    const event = new CustomEvent('sw-update-available');
    window.dispatchEvent(event);
}

/**
 * Skip waiting and activate new service worker
 */
export function skipWaiting() {
    if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    }
}

/**
 * Request background sync
 */
export async function requestBackgroundSync(tag) {
    if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
        try {
            const registration = await navigator.serviceWorker.ready;
            await registration.sync.register(tag);
            console.log('[SW] Background sync registered:', tag);
            return true;
        } catch (error) {
            console.error('[SW] Background sync failed:', error);
            return false;
        }
    }
    return false;
}

/**
 * Request push notification permission
 */
export async function requestNotificationPermission() {
    if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        console.log('[SW] Notification permission:', permission);
        return permission === 'granted';
    }
    return false;
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPushNotifications() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        try {
            const registration = await navigator.serviceWorker.ready;

            // Check if already subscribed
            let subscription = await registration.pushManager.getSubscription();

            if (!subscription) {
                // Subscribe to push notifications
                subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(
                        // Replace with your VAPID public key
                        'YOUR_VAPID_PUBLIC_KEY'
                    ),
                });
            }

            console.log('[SW] Push subscription:', subscription);
            return subscription;
        } catch (error) {
            console.error('[SW] Push subscription failed:', error);
            return null;
        }
    }
    return null;
}

/**
 * Convert VAPID key to Uint8Array
 */
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
}

/**
 * Check if app is running in standalone mode (installed)
 */
export function isStandalone() {
    return (
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true
    );
}

/**
 * Get install prompt readiness
 */
export function canInstall() {
    return 'beforeinstallprompt' in window;
}
