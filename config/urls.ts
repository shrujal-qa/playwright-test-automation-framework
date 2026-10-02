/**
 * Centralized URL Configuration
 * Contains: Application routes and external URLs
 */
export const URLS = {
    // Auth
    LOGIN: '/web/index.php/auth/login',

    // Dashboard
    DASHBOARD: '/web/index.php/dashboard/index',

    // Modules
    PIM: '/web/index.php/pim/viewEmployeeList',
    LEAVE: '/web/index.php/leave/viewLeaveList',

    // Admin
    ADMIN_USER_LIST: '/web/index.php/admin/viewSystemUsers',

    // PIM
    PIM_EMPLOYEE_LIST: '/web/index.php/pim/viewEmployeeList',
    PIM_ADD_EMPLOYEE: '/web/index.php/pim/addEmployee',

    // Leave
    LEAVE_APPLY: '/web/index.php/leave/applyLeave',
    LEAVE_LIST: '/web/index.php/leave/viewLeaveList',
    LEAVE_MY_ENTITLEMENTS: '/web/index.php/leave/viewMyLeaveEntitlements',
    LEAVE_ASSIGN: '/web/index.php/leave/assignLeave',
} as const;
