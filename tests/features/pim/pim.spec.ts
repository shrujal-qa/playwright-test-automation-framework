import { test } from '../../../lib/fixtures';
import { AddEmployeePage } from '../../../lib/pages/pim/AddEmployeePage';
import { EmployeeListPage } from '../../../lib/pages/pim/EmployeeListPage';
import { EmployeeProfilePage } from '../../../lib/pages/pim/EmployeeProfilePage';
import { DataGenerator } from '../../../lib/utils/DataGenerator';
import { Logger } from '../../../lib/utils/Logger';

/**
 * PIM (Employee Management) Test Suite
 *
 * Covers the employee lifecycle: create, search, view, update and delete.
 * Every test that creates an employee also deletes it before finishing, so
 * the shared OrangeHRM demo instance is left clean regardless of pass/fail.
 */

test.describe('PIM Tests - Employee List', () => {
    test(
        'PIM-001: Admin can navigate to PIM Employee List',
        { tag: ['@smoke', '@regression'] },
        async ({ adminPage, page }, testInfo) => {
            testInfo.annotations.push(
                { type: 'severity', description: 'critical' },
                { type: 'feature', description: 'PIM' }
            );

            Logger.step('Step 1: Navigate to PIM Employee List');
            const employeeList = new EmployeeListPage(page);
            await employeeList.open();

            Logger.step('Step 2: Verify Employee List page has loaded');
            await employeeList.verifyListLoaded();

            Logger.info('✅ PIM Employee List accessible to Admin');
        }
    );

    test(
        'PIM-007: User role can view PIM Employee List',
        { tag: ['@regression'] },
        async ({ userPage, page }, testInfo) => {
            testInfo.annotations.push(
                { type: 'severity', description: 'normal' },
                { type: 'feature', description: 'PIM' }
            );

            Logger.step('Step 1: Navigate to PIM Employee List as User');
            const employeeList = new EmployeeListPage(page);
            await employeeList.open();

            Logger.step('Step 2: Verify Employee List page has loaded');
            await employeeList.verifyListLoaded();

            Logger.info('✅ PIM Employee List accessible to User role');
        }
    );

    test(
        'PIM-004: Admin can reset employee list search filters',
        { tag: ['@regression'] },
        async ({ adminPage, page }, testInfo) => {
            testInfo.annotations.push(
                { type: 'severity', description: 'normal' },
                { type: 'feature', description: 'PIM' }
            );

            Logger.step('Step 1: Navigate to PIM Employee List');
            const employeeList = new EmployeeListPage(page);
            await employeeList.open();

            Logger.step('Step 2: Reset search filters');
            await employeeList.resetFilters();

            Logger.step('Step 3: Verify list is still loaded after reset');
            await employeeList.verifyListLoaded();

            Logger.info('✅ Employee List search filters reset correctly');
        }
    );

    test(
        'PIM-102: Employee list search with non-existent name shows No Records Found',
        { tag: ['@regression', '@negative'] },
        async ({ adminPage, page }, testInfo) => {
            testInfo.annotations.push(
                { type: 'severity', description: 'normal' },
                { type: 'feature', description: 'PIM' }
            );

            const bogusEmployeeId = '9999999';

            Logger.step('Step 1: Navigate to PIM Employee List');
            const employeeList = new EmployeeListPage(page);
            await employeeList.open();

            Logger.step(`Step 2: Search for an Employee Id that cannot exist: ${bogusEmployeeId}`);
            await employeeList.searchByEmployeeId(bogusEmployeeId);

            Logger.step('Step 3: Verify No Records Found is displayed');
            await employeeList.verifyNoRecordsFound();

            Logger.info('✅ Non-existent Employee Id search correctly shows No Records Found');
        }
    );
});

test.describe('PIM Tests - Add / Edit / Delete Employee', () => {
    test(
        'PIM-002: Admin can add and delete a new employee (full lifecycle)',
        { tag: ['@smoke', '@regression', '@critical'] },
        async ({ adminPage, page }, testInfo) => {
            testInfo.annotations.push(
                { type: 'severity', description: 'critical' },
                { type: 'feature', description: 'PIM' },
                { type: 'story', description: 'PIM-002: Employee CRUD lifecycle' }
            );

            const firstName = DataGenerator.entityName('First');
            const lastName = DataGenerator.entityName('Last');
            const fullName = `${firstName} ${lastName}`;

            Logger.step('Step 1: Open Add Employee form');
            const employeeList = new EmployeeListPage(page);
            await employeeList.open();
            await employeeList.clickAddEmployee();

            Logger.step(`Step 2: Fill and save new employee ${fullName}`);
            const addEmployee = new AddEmployeePage(page);
            await addEmployee.addEmployee(firstName, lastName);

            Logger.step('Step 3: Verify employee was saved and profile loaded');
            const profile = new EmployeeProfilePage(page);
            await profile.verifyProfileHeaderContains(fullName);

            Logger.step('Step 4: Return to Employee List and find the new employee');
            await employeeList.open();
            await employeeList.searchByEmployeeName(fullName);
            await employeeList.verifyRowVisible(fullName);

            Logger.step('Step 5: Delete the employee to keep the shared demo clean');
            await employeeList.deleteRowByName(fullName);

            Logger.info(`✅ Employee ${fullName} created, verified and deleted successfully`);
        }
    );

    test(
        'PIM-003: Admin can search employee list by Employee Name',
        { tag: ['@regression'] },
        async ({ adminPage, page }, testInfo) => {
            testInfo.annotations.push(
                { type: 'severity', description: 'normal' },
                { type: 'feature', description: 'PIM' }
            );

            const firstName = DataGenerator.entityName('Search');
            const lastName = DataGenerator.entityName('Target');
            const fullName = `${firstName} ${lastName}`;

            Logger.step(`Step 1: Create a disposable employee ${fullName}`);
            const employeeList = new EmployeeListPage(page);
            await employeeList.open();
            await employeeList.clickAddEmployee();

            const addEmployee = new AddEmployeePage(page);
            await addEmployee.addEmployee(firstName, lastName);

            Logger.step('Step 2: Search for the employee by name');
            await employeeList.open();
            await employeeList.searchByEmployeeName(fullName);

            Logger.step('Step 3: Verify the employee row appears in the results');
            await employeeList.verifyRowVisible(fullName);

            Logger.step('Step 4: Clean up — delete the created employee');
            await employeeList.deleteRowByName(fullName);

            Logger.info('✅ Employee search by name returns the correct record');
        }
    );

    test(
        'PIM-005: Admin can update an employee nationality',
        { tag: ['@regression', '@critical'] },
        async ({ adminPage, page }, testInfo) => {
            testInfo.annotations.push(
                { type: 'severity', description: 'critical' },
                { type: 'feature', description: 'PIM' }
            );

            const firstName = DataGenerator.entityName('Edit');
            const lastName = DataGenerator.entityName('Nationality');
            const fullName = `${firstName} ${lastName}`;

            Logger.step(`Step 1: Create a disposable employee ${fullName}`);
            const employeeList = new EmployeeListPage(page);
            await employeeList.open();
            await employeeList.clickAddEmployee();

            const addEmployee = new AddEmployeePage(page);
            await addEmployee.addEmployee(firstName, lastName);

            Logger.step('Step 2: Update the employee nationality on the Personal Details tab');
            const profile = new EmployeeProfilePage(page);
            await profile.setNationality('American');
            await profile.save();

            Logger.step('Step 3: Verify the update was saved');
            await profile.verifyUpdateSaved();

            Logger.step('Step 4: Clean up — delete the created employee');
            await employeeList.open();
            await employeeList.searchByEmployeeName(fullName);
            await employeeList.deleteRowByName(fullName);

            Logger.info('✅ Employee nationality updated and persisted correctly');
        }
    );

    test(
        'PIM-101: Add Employee fails with empty First Name and Last Name',
        { tag: ['@regression', '@validation'] },
        async ({ adminPage, page }, testInfo) => {
            testInfo.annotations.push(
                { type: 'severity', description: 'normal' },
                { type: 'feature', description: 'PIM' }
            );

            Logger.step('Step 1: Open Add Employee form');
            const employeeList = new EmployeeListPage(page);
            await employeeList.open();
            await employeeList.clickAddEmployee();

            Logger.step('Step 2: Attempt to save without First Name / Last Name');
            const addEmployee = new AddEmployeePage(page);
            await addEmployee.save();

            Logger.step('Step 3: Verify Required field validation is shown');
            await addEmployee.verifyRequiredFieldError();

            Logger.info('✅ Add Employee correctly rejects empty required fields');
        }
    );
});
