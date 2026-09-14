/**
 * User-Facing Messages
 * Contains: Success/Error/Toast/Notification text
 */
export const MESSAGES = {
    LOGIN_FAILED: 'Invalid credentials',
    REQUIRED: 'Required',
    LOGIN_SUCCESS: 'Login successful',
    DASHBOARD_LOADED: 'Dashboard loaded successfully',

    // Generic OrangeHRM OXD toast messages — reused across modules
    SUCCESSFULLY_SAVED: 'Successfully Saved',
    SUCCESSFULLY_UPDATED: 'Successfully Updated',
    SUCCESSFULLY_DELETED: 'Successfully Deleted',
    NO_RECORDS_FOUND: 'No Records Found',
    PASSWORDS_DO_NOT_MATCH: 'Passwords do not match',
    INVALID_EMAIL: 'Should be a valid email address',
} as const;
