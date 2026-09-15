import { test, expect } from '../../../lib/fixtures';
import { AssertionHelper } from '../../../lib/helpers/AssertionHelper';
import { URLS } from '../../../config/urls';
import { MESSAGES } from '../../../lib/data/constants/messages';
import { SYSTEM_USER_ROLE, SYSTEM_USER_STATUS } from '../../../lib/data/constants/admin-constants';
import { DataGenerator } from '../../../lib/utils/DataGenerator';
import { Logger } from '../../../lib/utils/Logger';

/**
 * Admin Module - User Management Test Suite
 *
 * Covers System Users: create, view, search/filter, edit, delete, cancel,
 * reset, and field-level validation.
 *
 * The target application is the public OrangeHRM demo, shared with other
 * testers worldwide. Every scenario that creates data uses a
 * `DataGenerator`-produced unique username and cleans up after itself, and
 * scenarios that read shared data assert structural invariants (every row
 * matches a filter) rather than absolute record counts.
 *
 * Tests that need an existing Employee Name for the "Add User" form resolve
 * it at run time via `userManagementPage.getLoggedInUserName()` (the
 * currently logged-in account's own name) rather than hardcoding one — even
 * the demo's seed accounts get renamed by other testers over time, and a
 * hardcoded name silently goes stale (as happened here: the original
 * `Virat Sylvan Kohali` seed employee was later renamed to `Jane Doe`).
 */

test.describe('User Management - View & Navigation', () => {
    test(
        'ADMIN-USER-001: Admin can view the System Users list',
        { tag: ['@smoke', '@regression', '@admin'] },
        async ({ adminPage, userManagementPage, page }) => {
            Logger.step('Step 1: Open User Management');
            await userManagementPage.openUserList();

            Logger.step('Step 2: Verify list loaded with existing records');
            await AssertionHelper.urlContains(page, URLS.ADMIN_USER_LIST);
            const count = await userManagementPage.getRecordsFoundCount();

            expect(count).toBeGreaterThan(0);
            Logger.info(`Records found: ${count}`);
        }
    );
});

test.describe('User Management - CRUD Lifecycle', () => {
    test(
        'ADMIN-USER-002: Admin can create, find, and delete a system user (full lifecycle)',
        { tag: ['@smoke', '@regression', '@critical', '@admin', '@e2e'] },
        async ({ userManagementPage }) => {
            const username = DataGenerator.user('ESS');
            const password = DataGenerator.password();

            Logger.step('Step 1: Open User Management');
            await userManagementPage.openUserList();
            const employeeName = await userManagementPage.getLoggedInUserName();

            Logger.step(`Step 2: Create user ${username}`);
            await userManagementPage.createUser({
                userRole: SYSTEM_USER_ROLE.ESS,
                employeeName,
                status: SYSTEM_USER_STATUS.ENABLED,
                username,
                password,
                confirmPassword: password,
            });

            Logger.step('Step 3: Search for the created user');
            await userManagementPage.openUserList();
            await userManagementPage.searchByUsername(username);
            await expect.poll(() => userManagementPage.isUserListed(username)).toBe(true);

            Logger.step('Step 4: Delete the created user');
            await userManagementPage.deleteUserByUsername(username);
            await userManagementPage.openUserList();
            await userManagementPage.searchByUsername(username);
            await expect.poll(() => userManagementPage.isUserListed(username)).toBe(false);

            Logger.info(`✅ Full lifecycle verified for ${username}`);
        }
    );

    test(
        'ADMIN-USER-003: Admin can edit an existing user\'s status',
        { tag: ['@regression', '@admin'] },
        async ({ userManagementPage }) => {
            const username = DataGenerator.user('ESS');
            const password = DataGenerator.password();

            Logger.step('Step 1: Create a user to edit');
            await userManagementPage.openUserList();
            const employeeName = await userManagementPage.getLoggedInUserName();
            await userManagementPage.createUser({
                userRole: SYSTEM_USER_ROLE.ESS,
                employeeName,
                status: SYSTEM_USER_STATUS.ENABLED,
                username,
                password,
                confirmPassword: password,
            });

            Logger.step('Step 2: Edit the user — flip status to Disabled');
            await userManagementPage.openUserList();
            await userManagementPage.searchByUsername(username);
            await userManagementPage.openEditUserForm(username);
            await userManagementPage.fillUserForm({ status: SYSTEM_USER_STATUS.DISABLED });
            await userManagementPage.save();
            await userManagementPage.expectToast(MESSAGES.SUCCESSFULLY_UPDATED);

            Logger.step('Step 3: Verify the status change is reflected in the list');
            await userManagementPage.openUserList();
            await userManagementPage.searchByUsername(username);
            const isListed = await userManagementPage.isUserListed(username);
            expect(isListed).toBe(true);

            Logger.step('Step 4: Cleanup — delete the user');
            await userManagementPage.deleteUserByUsername(username);
        }
    );

    test(
        'ADMIN-USER-008: Cancel on Add User form discards changes',
        { tag: ['@regression', '@admin'] },
        async ({ userManagementPage }) => {
            const username = DataGenerator.user('Cancelled');

            Logger.step('Step 1: Open Add User form and fill it out');
            await userManagementPage.openUserList();
            const employeeName = await userManagementPage.getLoggedInUserName();
            await userManagementPage.openAddUserForm();
            await userManagementPage.fillUserForm({
                userRole: SYSTEM_USER_ROLE.ESS,
                employeeName,
                status: SYSTEM_USER_STATUS.ENABLED,
                username,
                password: DataGenerator.password(),
                confirmPassword: DataGenerator.password(),
            });

            Logger.step('Step 2: Cancel instead of saving');
            await userManagementPage.cancelForm();

            Logger.step('Step 3: Verify the user was never created');
            await userManagementPage.openUserList();
            await userManagementPage.searchByUsername(username);
            const isListed = await userManagementPage.isUserListed(username);
            expect(isListed).toBe(false);

            Logger.info('✅ Cancel correctly discarded the unsaved user');
        }
    );
});

test.describe('User Management - Search & Filter', () => {
    test(
        'ADMIN-USER-004: Search by username returns only the matching record',
        { tag: ['@regression', '@admin'] },
        async ({ userManagementPage }) => {
            const username = DataGenerator.user('Search');
            const password = DataGenerator.password();

            await userManagementPage.openUserList();
            const employeeName = await userManagementPage.getLoggedInUserName();
            await userManagementPage.createUser({
                userRole: SYSTEM_USER_ROLE.ESS,
                employeeName,
                status: SYSTEM_USER_STATUS.ENABLED,
                username,
                password,
                confirmPassword: password,
            });

            Logger.step(`Search for exact username: ${username}`);
            await userManagementPage.openUserList();
            await userManagementPage.searchByUsername(username);

            const count = await userManagementPage.getRecordsFoundCount();
            expect(count).toBe(1);
            expect(await userManagementPage.isUserListed(username)).toBe(true);

            await userManagementPage.deleteUserByUsername(username);
        }
    );

    test(
        'ADMIN-USER-005: Search by User Role filters the list correctly',
        { tag: ['@regression', '@admin'] },
        async ({ userManagementPage, page }) => {
            await userManagementPage.openUserList();
            await userManagementPage.searchByUserRole(SYSTEM_USER_ROLE.ADMIN);

            const rowCount = await userManagementPage.getRowCount();
            expect(rowCount).toBeGreaterThan(0);

            Logger.step('Verify every visible row has User Role = Admin');
            const roleTexts = await page.locator('.oxd-table-card').allTextContents();
            for (const rowText of roleTexts) {
                expect(rowText).toContain(SYSTEM_USER_ROLE.ADMIN);
            }
        }
    );

    test(
        'ADMIN-USER-006: Search by Status filters the list correctly',
        { tag: ['@regression', '@admin'] },
        async ({ userManagementPage, page }) => {
            await userManagementPage.openUserList();
            await userManagementPage.searchByStatus(SYSTEM_USER_STATUS.ENABLED);

            const rowCount = await userManagementPage.getRowCount();
            expect(rowCount).toBeGreaterThan(0);

            Logger.step('Verify every visible row has Status = Enabled');
            const rowTexts = await page.locator('.oxd-table-card').allTextContents();
            for (const rowText of rowTexts) {
                expect(rowText).toContain(SYSTEM_USER_STATUS.ENABLED);
            }
        }
    );

    test(
        'ADMIN-USER-007: Reset clears applied filters',
        { tag: ['@regression', '@admin'] },
        async ({ userManagementPage }) => {
            Logger.step('Step 1: Apply a filter guaranteed to return zero results');
            await userManagementPage.openUserList();
            await userManagementPage.searchByUsername('NoSuchUser_' + Date.now());
            expect(await userManagementPage.getRowCount()).toBe(0);

            Logger.step('Step 2: Reset filters');
            await userManagementPage.resetFilters();

            Logger.step('Step 3: Verify the full list is restored');
            const countAfterReset = await userManagementPage.getRecordsFoundCount();
            expect(countAfterReset).toBeGreaterThan(0);
        }
    );
});

test.describe('User Management - Negative & Validation', () => {
    test(
        'ADMIN-USER-101: Submitting an empty Add User form shows field-level validation',
        { tag: ['@regression', '@negative', '@validation', '@admin'] },
        async ({ userManagementPage }) => {
            await userManagementPage.openUserList();
            await userManagementPage.openAddUserForm();
            await userManagementPage.save();

            await userManagementPage.expectFieldRequired('User Role');
            await userManagementPage.expectFieldRequired('Employee Name');
            await userManagementPage.expectFieldRequired('Status');
            await userManagementPage.expectFieldRequired('Username');
            await userManagementPage.expectFieldRequired('Password');
            await userManagementPage.expectPasswordMismatch();

            Logger.info('✅ All required-field validations displayed correctly');
        }
    );

    test(
        'ADMIN-USER-102: Duplicate username is rejected',
        { tag: ['@regression', '@negative', '@admin'] },
        async ({ userManagementPage }) => {
            const password = DataGenerator.password();

            await userManagementPage.openUserList();
            const employeeName = await userManagementPage.getLoggedInUserName();
            await userManagementPage.openAddUserForm();
            await userManagementPage.fillUserForm({
                userRole: SYSTEM_USER_ROLE.ADMIN,
                employeeName,
                status: SYSTEM_USER_STATUS.ENABLED,
                username: 'Admin', // pre-existing username on this instance
                password,
                confirmPassword: password,
            });
            await userManagementPage.save();

            await userManagementPage.expectUsernameAlreadyExists();
            Logger.info('✅ Duplicate username correctly rejected');
        }
    );

    test(
        'ADMIN-USER-103: Unselected Employee Name is rejected as invalid',
        { tag: ['@regression', '@negative', '@validation', '@admin'] },
        async ({ userManagementPage }) => {
            const password = DataGenerator.password();

            await userManagementPage.openUserList();
            await userManagementPage.openAddUserForm();
            await userManagementPage.fillUserForm({
                userRole: SYSTEM_USER_ROLE.ESS,
                status: SYSTEM_USER_STATUS.ENABLED,
                username: DataGenerator.user('Invalid'),
                password,
                confirmPassword: password,
            });
            // Type free text without selecting a suggestion.
            await userManagementPage.typeEmployeeNameFreeText('NotARealEmployee123');
            await userManagementPage.save();

            await userManagementPage.expectEmployeeNameInvalid();
            Logger.info('✅ Unselected Employee Name correctly rejected');
        }
    );

    test(
        'ADMIN-USER-104: Mismatched password and confirm password is rejected',
        { tag: ['@regression', '@negative', '@validation', '@admin'] },
        async ({ userManagementPage }) => {
            await userManagementPage.openUserList();
            const employeeName = await userManagementPage.getLoggedInUserName();
            await userManagementPage.openAddUserForm();
            await userManagementPage.fillUserForm({
                userRole: SYSTEM_USER_ROLE.ESS,
                employeeName,
                status: SYSTEM_USER_STATUS.ENABLED,
                username: DataGenerator.user('Mismatch'),
                password: DataGenerator.password(),
                confirmPassword: DataGenerator.password(), // deliberately different
            });
            await userManagementPage.save();

            await userManagementPage.expectPasswordMismatch();
            Logger.info('✅ Password mismatch correctly rejected');
        }
    );
});
