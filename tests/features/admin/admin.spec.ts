import { test } from '../../../lib/fixtures';
import { SystemUsersPage } from '../../../lib/pages/admin/SystemUsersPage';
import { AddUserPage } from '../../../lib/pages/admin/AddUserPage';
import { EmployeeListPage } from '../../../lib/pages/pim/EmployeeListPage';
import { AddEmployeePage } from '../../../lib/pages/pim/AddEmployeePage';
import { DataGenerator } from '../../../lib/utils/DataGenerator';
import { Logger } from '../../../lib/utils/Logger';
import { USERS } from '../../../lib/data/users';
import { USER_ROLES } from '../../../lib/data/constants/roles';

/**
 * Admin Module Test Suite — System Users
 *
 * Full-lifecycle tests create a disposable PIM employee first (so the
 * Employee Name autocomplete on Add User has a guaranteed, exact match),
 * then create/edit/delete the linked system user, and finally remove the
 * employee — leaving the shared demo instance exactly as it was found.
 */

async function createDisposableEmployee(page: import('@playwright/test').Page) {
    // Kept short: the Add User "Employee Name" autocomplete search never
    // returned a suggestion for the full-length entityName() output
    // (confirmed in CI — the same ~30-character limit Recruitment's Full
    // Name field enforces explicitly seems to affect this search too).
    const firstName = DataGenerator.shortEntityName('Sys');
    const lastName = DataGenerator.shortEntityName('Emp');
    const fullName = `${firstName} ${lastName}`;

    const employeeList = new EmployeeListPage(page);
    await employeeList.open();
    await employeeList.clickAddEmployee();

    const addEmployee = new AddEmployeePage(page);
    await addEmployee.addEmployee(firstName, lastName);

    return { firstName, fullName, employeeList };
}

test.describe('Admin Tests - System Users List', () => {
    test(
        'ADM-001: Admin can navigate to System Users list',
        { tag: ['@smoke', '@regression'] },
        async ({ adminPage, page }, testInfo) => {
            testInfo.annotations.push(
                { type: 'severity', description: 'critical' },
                { type: 'feature', description: 'Admin' }
            );

            Logger.step('Step 1: Navigate to System Users');
            const systemUsers = new SystemUsersPage(page);
            await systemUsers.open();

            Logger.step('Step 2: Verify System Users list has loaded');
            await systemUsers.verifyListLoaded();

            Logger.info('✅ System Users list accessible to Admin');
        }
    );

    test(
        'ADM-003: Admin can search system users by username',
        { tag: ['@regression'] },
        async ({ adminPage, page }, testInfo) => {
            testInfo.annotations.push(
                { type: 'severity', description: 'normal' },
                { type: 'feature', description: 'Admin' }
            );

            const adminUsername = USERS[USER_ROLES.ADMIN].username;

            Logger.step('Step 1: Navigate to System Users');
            const systemUsers = new SystemUsersPage(page);
            await systemUsers.open();

            Logger.step(`Step 2: Search for the known "${adminUsername}" username`);
            await systemUsers.searchByUsername(adminUsername);

            Logger.step('Step 3: Verify the row is visible in the results');
            await systemUsers.verifyRowVisible(adminUsername);

            Logger.info('✅ System user search by username works correctly');
        }
    );

    test(
        'ADM-103: Search Users with a non-existent username shows No Records Found',
        { tag: ['@regression', '@negative'] },
        async ({ adminPage, page }, testInfo) => {
            testInfo.annotations.push(
                { type: 'severity', description: 'normal' },
                { type: 'feature', description: 'Admin' }
            );

            const bogusUsername = DataGenerator.user('NoSuchUser');

            Logger.step('Step 1: Navigate to System Users');
            const systemUsers = new SystemUsersPage(page);
            await systemUsers.open();

            Logger.step(`Step 2: Search for a username that cannot exist: ${bogusUsername}`);
            await systemUsers.searchByUsername(bogusUsername);

            Logger.step('Step 3: Verify No Records Found is displayed');
            await systemUsers.verifyNoRecordsFound();

            Logger.info('✅ Non-existent username search correctly shows No Records Found');
        }
    );
});

test.describe('Admin Tests - Add / Edit / Delete System User', () => {
    test(
        'ADM-002: Admin can add and delete a new system user (full lifecycle)',
        { tag: ['@smoke', '@regression', '@critical'] },
        async ({ adminPage, page }, testInfo) => {
            testInfo.annotations.push(
                { type: 'severity', description: 'critical' },
                { type: 'feature', description: 'Admin' },
                { type: 'story', description: 'ADM-002: System user CRUD lifecycle' }
            );
            // The employee picker and post-creation search may each retry
            // a few times against the shared demo instance; give it room.
            testInfo.setTimeout(120_000);

            const username = DataGenerator.user('ESS');
            const password = 'Pw@12345';

            Logger.step('Step 1: Create a disposable employee to link the new user to');
            const { firstName, fullName, employeeList } = await createDisposableEmployee(page);

            Logger.step(`Step 2: Add a new ESS system user (${username}) for that employee`);
            const systemUsers = new SystemUsersPage(page);
            await systemUsers.open();
            await systemUsers.clickAddUser();

            const addUser = new AddUserPage(page);
            await addUser.addUser({
                role: 'ESS',
                // The Employee Name autocomplete matches more reliably on the
                // short, unique first name than the full "first last" string.
                employeeName: firstName,
                status: 'Enabled',
                username,
                password,
            });

            Logger.step('Step 3: Verify the new user appears in the System Users list');
            await systemUsers.open();
            await systemUsers.searchUntilFound(username);

            Logger.step('Step 4: Clean up — delete the user, then the employee');
            await systemUsers.deleteUserByUsername(username);
            await employeeList.open();
            await employeeList.searchByEmployeeName(fullName);
            await employeeList.deleteRowByName(fullName);

            Logger.info(`✅ System user ${username} created, verified and deleted successfully`);
        }
    );

    test(
        'ADM-004: Admin can edit a system user status',
        { tag: ['@regression', '@critical'] },
        async ({ adminPage, page }, testInfo) => {
            testInfo.annotations.push(
                { type: 'severity', description: 'critical' },
                { type: 'feature', description: 'Admin' }
            );
            testInfo.setTimeout(120_000);

            const username = DataGenerator.user('Status');
            const password = 'Pw@12345';

            Logger.step('Step 1: Create a disposable employee and linked user');
            const { firstName, fullName, employeeList } = await createDisposableEmployee(page);

            const systemUsers = new SystemUsersPage(page);
            await systemUsers.open();
            await systemUsers.clickAddUser();

            const addUser = new AddUserPage(page);
            await addUser.addUser({
                role: 'ESS',
                employeeName: firstName,
                status: 'Enabled',
                username,
                password,
            });

            Logger.step('Step 2: Open the user and change its status to Disabled');
            await systemUsers.open();
            await systemUsers.searchUntilFound(username);
            await systemUsers.openUserByUsername(username);
            await systemUsers.changeStatusForRow('Disabled');

            Logger.step('Step 3: Verify the status change persisted by re-searching the user');
            await systemUsers.open();
            await systemUsers.searchByUsername(username);
            await systemUsers.verifyRowHasStatus(username, 'Disabled');

            Logger.step('Step 4: Clean up — delete the user, then the employee');
            await systemUsers.open();
            await systemUsers.searchByUsername(username);
            await systemUsers.deleteUserByUsername(username);
            await employeeList.open();
            await employeeList.searchByEmployeeName(fullName);
            await employeeList.deleteRowByName(fullName);

            Logger.info(`✅ System user ${username} status updated successfully`);
        }
    );

    test(
        'ADM-101: Add User fails when passwords do not match',
        { tag: ['@regression', '@negative'] },
        async ({ adminPage, page }, testInfo) => {
            testInfo.annotations.push(
                { type: 'severity', description: 'normal' },
                { type: 'feature', description: 'Admin' }
            );

            const username = DataGenerator.user('Mismatch');

            Logger.step('Step 1: Open Add User form');
            const systemUsers = new SystemUsersPage(page);
            await systemUsers.open();
            await systemUsers.clickAddUser();

            Logger.step('Step 2: Fill mismatched passwords');
            const addUser = new AddUserPage(page);
            await addUser.selectUserRole('ESS');
            await addUser.fillCredentials(username, 'Pw@12345', 'Different@123');
            await addUser.save();

            Logger.step('Step 3: Verify passwords-do-not-match validation is shown');
            await addUser.verifyPasswordMismatchError();

            Logger.info('✅ Add User correctly rejects mismatched passwords');
        }
    );

    test(
        'ADM-102: Add User fails with required fields empty',
        { tag: ['@regression', '@validation'] },
        async ({ adminPage, page }, testInfo) => {
            testInfo.annotations.push(
                { type: 'severity', description: 'normal' },
                { type: 'feature', description: 'Admin' }
            );

            Logger.step('Step 1: Open Add User form');
            const systemUsers = new SystemUsersPage(page);
            await systemUsers.open();
            await systemUsers.clickAddUser();

            Logger.step('Step 2: Attempt to save without filling any field');
            const addUser = new AddUserPage(page);
            await addUser.save();

            Logger.step('Step 3: Verify Required field validation is shown');
            await addUser.verifyRequiredFieldError();

            Logger.info('✅ Add User correctly rejects empty required fields');
        }
    );
});
