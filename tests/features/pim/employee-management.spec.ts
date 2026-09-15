import { test, expect } from '../../../lib/fixtures';
import { AssertionHelper } from '../../../lib/helpers/AssertionHelper';
import { URLS } from '../../../config/urls';
import { DataGenerator } from '../../../lib/utils/DataGenerator';
import { Logger } from '../../../lib/utils/Logger';

/**
 * PIM Module - Employee Management Test Suite
 *
 * Covers the Employee List and the Add Employee / Personal Details flow:
 * create, view, search/filter, sort/pagination, edit, delete, cancel, and
 * field-level validation.
 *
 * As with Admin, the target is the public shared OrangeHRM demo: every
 * scenario that creates data uses a `DataGenerator`-produced unique last
 * name and deletes it before the test ends, and read-only scenarios assert
 * structural invariants rather than absolute record counts.
 *
 * Scope note: only the Employee List and the "Personal Details" tab are
 * modeled so far (`EmployeeListPage`, `AddEmployeePage`,
 * `EmployeeDetailsPage`). The remaining profile tabs (Contact Details,
 * Emergency Contacts, Dependents, Immigration, Job, Salary, Qualifications,
 * Memberships) are a tracked gap — see docs/test-coverage.md roadmap.
 */

test.describe('Employee Management - View & Navigation', () => {
    test(
        'PIM-001: Admin can view the Employee List',
        { tag: ['@smoke', '@regression', '@pim'] },
        async ({ adminPage, employeeListPage, page }) => {
            Logger.step('Step 1: Open Employee List');
            await employeeListPage.open();

            Logger.step('Step 2: Verify list loaded with existing records');
            await AssertionHelper.urlContains(page, URLS.PIM_EMPLOYEE_LIST);
            const count = await employeeListPage.getRecordsFoundCount();

            expect(count).toBeGreaterThan(0);
            Logger.info(`Records found: ${count}`);
        }
    );
});

test.describe('Employee Management - CRUD Lifecycle', () => {
    test(
        'PIM-002: Admin can create, find, and delete an employee (full lifecycle)',
        { tag: ['@smoke', '@regression', '@critical', '@pim', '@e2e'] },
        async ({ employeeListPage, addEmployeePage }) => {
            const lastName = DataGenerator.shortEntityName('Lifecycle');
            const displayName = `PW ${lastName}`;

            Logger.step('Step 1: Open Add Employee');
            await employeeListPage.open();
            await employeeListPage.goToAddEmployee();

            Logger.step(`Step 2: Create employee ${displayName}`);
            await addEmployeePage.createEmployee({ firstName: 'PW', lastName });

            Logger.step('Step 3: Search for the created employee');
            await employeeListPage.open();
            await employeeListPage.searchByEmployeeName(displayName);
            await expect.poll(() => employeeListPage.isEmployeeListed(lastName)).toBe(true);

            Logger.step('Step 4: Delete the created employee');
            await employeeListPage.deleteEmployeeByName(lastName);
            await employeeListPage.open();
            await employeeListPage.searchByEmployeeName(displayName);
            await expect.poll(() => employeeListPage.isEmployeeListed(lastName)).toBe(false);

            Logger.info(`✅ Full lifecycle verified for ${displayName}`);
        }
    );

    test(
        'PIM-003: Admin can create an employee with a custom Employee Id and middle name',
        { tag: ['@regression', '@pim'] },
        async ({ employeeListPage, addEmployeePage, employeeDetailsPage }) => {
            const lastName = DataGenerator.shortEntityName('FullName');
            const employeeId = DataGenerator.number(6);

            Logger.step('Step 1: Create employee with middle name and custom Employee Id');
            await employeeListPage.open();
            await employeeListPage.goToAddEmployee();
            await addEmployeePage.createEmployee({
                firstName: 'PW',
                middleName: 'Middle',
                lastName,
                employeeId,
            });

            Logger.step('Step 2: Verify Personal Details reflects the entered name');
            const name = await employeeDetailsPage.getFullName();
            expect(name.firstName).toBe('PW');
            expect(name.middleName).toBe('Middle');
            expect(name.lastName).toBe(lastName);

            Logger.step('Step 3: Cleanup — delete the employee');
            const empNumber = employeeDetailsPage.getEmployeeNumberFromUrl();
            await employeeListPage.open();
            await employeeListPage.searchByEmployeeId(employeeId);
            await employeeListPage.deleteEmployeeByName(lastName);
            Logger.info(`✅ Verified and cleaned up employee #${empNumber}`);
        }
    );

    test(
        'PIM-004: Admin can edit an employee\'s Personal Details',
        { tag: ['@regression', '@pim'] },
        async ({ employeeListPage, addEmployeePage, employeeDetailsPage }) => {
            const originalLastName = DataGenerator.shortEntityName('Orig');
            const updatedLastName = DataGenerator.shortEntityName('Upd');

            Logger.step('Step 1: Create an employee to edit');
            await employeeListPage.open();
            await employeeListPage.goToAddEmployee();
            const { employeeId } = await addEmployeePage.createEmployee({ firstName: 'PW', lastName: originalLastName });
            const empNumber = employeeDetailsPage.getEmployeeNumberFromUrl();

            Logger.step('Step 2: Update the last name on Personal Details');
            await employeeDetailsPage.updateName({ lastName: updatedLastName });

            Logger.step('Step 3: Re-open by employee number and verify the change persisted');
            await employeeDetailsPage.openByEmployeeNumber(empNumber);
            const name = await employeeDetailsPage.getFullName();
            expect(name.lastName).toBe(updatedLastName);

            Logger.step('Step 4: Cleanup — delete by Employee Id (name search can lag right after an edit)');
            await employeeListPage.open();
            await employeeListPage.searchByEmployeeId(employeeId);
            await employeeListPage.deleteEmployeeByName(updatedLastName);

            Logger.info(`✅ Personal Details update verified for employee #${empNumber}`);
        }
    );

    test(
        'PIM-005: Cancel on Add Employee discards changes',
        { tag: ['@regression', '@pim'] },
        async ({ employeeListPage, addEmployeePage }) => {
            const lastName = DataGenerator.shortEntityName('Cancelled');

            Logger.step('Step 1: Fill Add Employee form');
            await employeeListPage.open();
            await employeeListPage.goToAddEmployee();
            await addEmployeePage.fillBasicInfo({ firstName: 'PW', lastName });

            Logger.step('Step 2: Cancel instead of saving');
            await addEmployeePage.cancel();

            Logger.step('Step 3: Verify the employee was never created');
            await employeeListPage.open();
            await employeeListPage.searchByEmployeeName(`PW ${lastName}`);
            const isListed = await employeeListPage.isEmployeeListed(lastName);
            expect(isListed).toBe(false);

            Logger.info('✅ Cancel correctly discarded the unsaved employee');
        }
    );
});

test.describe('Employee Management - Search, Filter & Pagination', () => {
    test(
        'PIM-006: Search by Employee Name returns only the matching record',
        { tag: ['@regression', '@pim'] },
        async ({ employeeListPage, addEmployeePage }) => {
            const lastName = DataGenerator.shortEntityName('SearchName');

            await employeeListPage.open();
            await employeeListPage.goToAddEmployee();
            await addEmployeePage.createEmployee({ firstName: 'PW', lastName });

            Logger.step(`Search for exact employee name: PW ${lastName}`);
            await employeeListPage.open();
            await employeeListPage.searchByEmployeeName(`PW ${lastName}`);

            const count = await employeeListPage.getRecordsFoundCount();
            expect(count).toBe(1);
            expect(await employeeListPage.isEmployeeListed(lastName)).toBe(true);

            await employeeListPage.deleteEmployeeByName(lastName);
        }
    );

    test(
        'PIM-007: Search by Employee Id returns only the matching record',
        { tag: ['@regression', '@pim'] },
        async ({ employeeListPage, addEmployeePage }) => {
            const lastName = DataGenerator.shortEntityName('SearchId');
            const employeeId = DataGenerator.number(6);

            await employeeListPage.open();
            await employeeListPage.goToAddEmployee();
            await addEmployeePage.createEmployee({ firstName: 'PW', lastName, employeeId });

            Logger.step(`Search for exact Employee Id: ${employeeId}`);
            await employeeListPage.open();
            await employeeListPage.searchByEmployeeId(employeeId);

            const count = await employeeListPage.getRecordsFoundCount();
            expect(count).toBe(1);
            expect(await employeeListPage.isEmployeeListed(lastName)).toBe(true);

            await employeeListPage.deleteEmployeeByName(lastName);
        }
    );

    test(
        'PIM-008: Reset clears applied filters',
        { tag: ['@regression', '@pim'] },
        async ({ employeeListPage }) => {
            Logger.step('Step 1: Apply a filter guaranteed to return zero results');
            await employeeListPage.open();
            await employeeListPage.searchByEmployeeId('NOSUCHID' + Date.now());
            expect(await employeeListPage.getRowCount()).toBe(0);

            Logger.step('Step 2: Reset filters');
            await employeeListPage.resetFilters();

            Logger.step('Step 3: Verify the full list is restored');
            const countAfterReset = await employeeListPage.getRecordsFoundCount();
            expect(countAfterReset).toBeGreaterThan(0);
        }
    );

    test(
        'PIM-009: Pagination navigates between pages of the Employee List',
        { tag: ['@regression', '@pim'] },
        async ({ employeeListPage }) => {
            await employeeListPage.open();

            const totalPages = await employeeListPage.getTotalPages();
            test.skip(totalPages < 2, 'Employee List has only one page on this instance — nothing to paginate.');

            Logger.step('Step 1: Capture page 1 row contents');
            const page1Rows = await employeeListPage.getAllRowTexts();
            expect(await employeeListPage.getCurrentPageNumber()).toBe(1);

            Logger.step('Step 2: Navigate to page 2');
            await employeeListPage.goToNextPage();
            expect(await employeeListPage.getCurrentPageNumber()).toBe(2);

            Logger.step('Step 3: Verify page 2 shows different records than page 1');
            const page2Rows = await employeeListPage.getAllRowTexts();
            expect(page2Rows).not.toEqual(page1Rows);

            Logger.info(`✅ Pagination verified across ${totalPages} pages`);
        }
    );
});

test.describe('Employee Management - Negative & Validation', () => {
    test(
        'PIM-101: Submitting an empty Add Employee form shows field-level validation',
        { tag: ['@regression', '@negative', '@validation', '@pim'] },
        async ({ addEmployeePage }) => {
            await addEmployeePage.open();
            await addEmployeePage.save();

            await addEmployeePage.expectFirstNameRequired();
            await addEmployeePage.expectLastNameRequired();

            Logger.info('✅ Required-field validation displayed correctly');
        }
    );

    test(
        'PIM-102: Duplicate Employee Id is rejected',
        { tag: ['@regression', '@negative', '@pim'] },
        async ({ addEmployeePage }) => {
            await addEmployeePage.open();
            await addEmployeePage.fillBasicInfo({
                firstName: 'PW',
                lastName: DataGenerator.shortEntityName('DupId'),
                employeeId: '0001', // pre-existing Employee Id on this instance
            });
            await addEmployeePage.save();

            await addEmployeePage.expectEmployeeIdAlreadyExists();
            Logger.info('✅ Duplicate Employee Id correctly rejected');
        }
    );
});
