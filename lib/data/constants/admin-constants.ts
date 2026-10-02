/**
 * Admin Module Constants
 * Contains: System User "User Role" / "Status" option values (Admin module → User Management)
 *
 * Not to be confused with `USER_ROLES` (roles.ts), which selects which
 * framework-level credential set to log in with.
 */
export const SYSTEM_USER_ROLE = {
    ADMIN: 'Admin',
    ESS: 'ESS',
} as const;

export type SystemUserRole = (typeof SYSTEM_USER_ROLE)[keyof typeof SYSTEM_USER_ROLE];

export const SYSTEM_USER_STATUS = {
    ENABLED: 'Enabled',
    DISABLED: 'Disabled',
} as const;

export type SystemUserStatus = (typeof SYSTEM_USER_STATUS)[keyof typeof SYSTEM_USER_STATUS];
