/**
 * Centralized error handling utilities
 * Provides consistent error messages and logging
 */

import toast from 'react-hot-toast';

/**
 * Error types for better categorization
 */
export const ErrorType = {
    NETWORK: 'NETWORK',
    AUTHENTICATION: 'AUTHENTICATION',
    VALIDATION: 'VALIDATION',
    SERVER: 'SERVER',
    UNKNOWN: 'UNKNOWN',
};

/**
 * User-friendly error messages
 */
const ERROR_MESSAGES = {
    [ErrorType.NETWORK]: 'Unable to connect to the server. Please check your internet connection.',
    [ErrorType.AUTHENTICATION]: 'Your session has expired. Please log in again.',
    [ErrorType.VALIDATION]: 'Please check your input and try again.',
    [ErrorType.SERVER]: 'Something went wrong on our end. Please try again later.',
    [ErrorType.UNKNOWN]: 'An unexpected error occurred. Please try again.',
};

/**
 * Determine error type from error object
 */
function getErrorType(error) {
    if (!error) return ErrorType.UNKNOWN;

    // Network errors
    if (error.message === 'Failed to fetch' || error.message === 'Network request failed') {
        return ErrorType.NETWORK;
    }

    // Authentication errors
    if (error.message?.includes('Not authenticated') ||
        error.message?.includes('Unauthorized') ||
        error.message?.includes('Invalid token')) {
        return ErrorType.AUTHENTICATION;
    }

    // Validation errors
    if (error.message?.includes('validation') ||
        error.message?.includes('required') ||
        error.message?.includes('invalid')) {
        return ErrorType.VALIDATION;
    }

    // Server errors
    if (error.message?.includes('500') ||
        error.message?.includes('Internal Server Error')) {
        return ErrorType.SERVER;
    }

    return ErrorType.UNKNOWN;
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error) {
    if (!error) return ERROR_MESSAGES[ErrorType.UNKNOWN];

    // If error has a specific message, use it
    if (error.message && !error.message.startsWith('HTTP')) {
        return error.message;
    }

    // Otherwise, use categorized message
    const errorType = getErrorType(error);
    return ERROR_MESSAGES[errorType];
}

/**
 * Handle and display error to user
 */
export function handleError(error, context = '') {
    console.error(`Error in ${context}:`, error);

    const message = getUserFriendlyMessage(error);
    toast.error(message);

    // Log to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
        // TODO: Send to error tracking service (e.g., Sentry)
        // logToErrorTracking(error, context);
    }

    return message;
}

/**
 * Async error wrapper for consistent error handling
 */
export function withErrorHandling(asyncFn, context = '') {
    return async (...args) => {
        try {
            return await asyncFn(...args);
        } catch (error) {
            handleError(error, context);
            throw error;
        }
    };
}

/**
 * Validate form fields
 */
export const validators = {
    email: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) return 'Email is required';
        if (!emailRegex.test(email)) return 'Please enter a valid email address';
        return null;
    },

    password: (password, minLength = 8) => {
        if (!password) return 'Password is required';
        if (password.length < minLength) return `Password must be at least ${minLength} characters`;
        return null;
    },

    required: (value, fieldName = 'This field') => {
        if (!value || (typeof value === 'string' && !value.trim())) {
            return `${fieldName} is required`;
        }
        return null;
    },

    match: (value1, value2, fieldName = 'Passwords') => {
        if (value1 !== value2) return `${fieldName} do not match`;
        return null;
    },
};

/**
 * Retry failed requests with exponential backoff
 */
export async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
    let lastError;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            // Don't retry on authentication or validation errors
            const errorType = getErrorType(error);
            if (errorType === ErrorType.AUTHENTICATION || errorType === ErrorType.VALIDATION) {
                throw error;
            }

            // Wait before retrying (exponential backoff)
            if (i < maxRetries - 1) {
                const delay = baseDelay * Math.pow(2, i);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError;
}
