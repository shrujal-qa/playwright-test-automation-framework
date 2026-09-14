/**
 * Centralized URL Configuration
 * Contains: Application routes and external URLs
 */
export const URLS = {
    // Auth
    LOGIN: '/web/index.php/auth/login',

    // Dashboard
    DASHBOARD: '/web/index.php/dashboard/index',

    // PIM
    PIM: '/web/index.php/pim/viewEmployeeList',
    PIM_ADD_EMPLOYEE: '/web/index.php/pim/addEmployee',

    // Leave
    LEAVE: '/web/index.php/leave/viewLeaveList',
    LEAVE_APPLY: '/web/index.php/leave/applyLeave',
    LEAVE_MY_LEAVE: '/web/index.php/leave/viewMyLeaveList',
    LEAVE_LIST: '/web/index.php/leave/viewLeaveList',

    // Admin — System Users
    ADMIN_USERS: '/web/index.php/admin/viewSystemUsers',

    // Recruitment
    RECRUITMENT: '/web/index.php/recruitment/viewCandidates',
    RECRUITMENT_ADD_CANDIDATE: '/web/index.php/recruitment/addCandidate',

    // My Info (ESS)
    MY_INFO: '/web/index.php/pim/viewMyDetails',

    // Directory
    DIRECTORY: '/web/index.php/directory/viewDirectory',
} as const;
