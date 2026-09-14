/**
 * User-Facing Messages
 * Contains: Success/Error/Toast/Notification text
 */
export const MESSAGES = {
    LOGIN_FAILED: 'Invalid credentials',
    REQUIRED: 'Required',
    LOGIN_SUCCESS: 'Login successful',
    DASHBOARD_LOADED: 'Dashboard loaded successfully',

    // Field-level validation
    INVALID: 'Invalid',
    PASSWORDS_DO_NOT_MATCH: 'Passwords do not match',
    USERNAME_ALREADY_EXISTS: 'Already exists',

    // Toast notifications (shared across modules)
    SUCCESSFULLY_SAVED: 'Successfully Saved',
    SUCCESSFULLY_UPDATED: 'Successfully Updated',
    SUCCESSFULLY_DELETED: 'Successfully Deleted',
} as const;
