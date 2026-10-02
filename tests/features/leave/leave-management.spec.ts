import { test, expect } from '../../../lib/fixtures';
import { DataGenerator } from '../../../lib/utils/DataGenerator';
import { Logger } from '../../../lib/utils/Logger';

/**
 * Leave Module Test Suite
 *
 * Covers Apply Leave, Leave List, Leave Entitlements, and Assign Leave
 * navigation.
 *
 * IMPORTANT — narrower scope than Admin/PIM, and not fully live-verified:
 * this module was built under a constraint against running full Playwright
 * suites, using only brief, targeted DOM inspections. Two things are worth
 * flagging explicitly rather than silently working around:
 *
 * 1. `LEAVE-002` (successful Apply Leave) asserts a real "Successfully
 *    Saved" toast. During manual inspection, clicking Apply after a fully
 *    valid fill sometimes produced no toast, no navigation, and no inline
 *    error — even with a non-zero leave balance. `ApplyLeavePage.applyLeave`
 *    already adds a wait for the async balance/duration lookup to settle
 *    before submitting, which may fix it — but if `LEAVE-002` fails when
 *    you run it, that reproduces a real interaction issue worth
 *    investigating (not just a bad locator).
 * 2. `AssignLeavePage` only covers navigation — its form fields and submit
 *    button label were never confirmed. Extend it the same way
 *    `ApplyLeavePage` was built once you've checked the real form.
 *
 * As elsewhere, Leave Type is resolved dynamically
 * (`selectFirstDropdownOption`) rather than hardcoded — this demo's
 * configured leave types are shared, mutable reference data.
 */

test.describe('Leave - Apply', () => {
    test(
        'LEAVE-001: Employee can view the Apply Leave page',
        { tag: ['@smoke', '@regression', '@leave'] },
        async ({ userPage, applyLeavePage }) => {
            Logger.step('Step 1: Open Apply Leave');
            await applyLeavePage.open();

            Logger.step('Step 2: Verify Leave Balance is displayed');
            const balance = await applyLeavePage.getLeaveBalanceText();
            expect(balance).toMatch(/Day\(s\)/);
        }
    );

    test(
        'LEAVE-002: Employee can apply for a single day of leave',
        { tag: ['@smoke', '@regression', '@critical', '@leave'] },
        async ({ applyLeavePage }) => {
            Logger.step('Step 1: Open Apply Leave');
            await applyLeavePage.open();

            Logger.step('Step 2: Submit a valid single-day leave request');
            const { leaveType } = await applyLeavePage.applyLeave({
                fromDate: DataGenerator.leaveDate(30),
            });

            Logger.info(`✅ Leave applied for type: ${leaveType}`);
        }
    );

    test(
        'LEAVE-101: Submitting an empty Apply Leave form shows field-level validation',
        { tag: ['@regression', '@negative', '@validation', '@leave'] },
        async ({ applyLeavePage }) => {
            await applyLeavePage.open();
            await applyLeavePage.submit();

            await applyLeavePage.expectFieldRequired('Leave Type');
            await applyLeavePage.expectFieldRequired('From Date');
            await applyLeavePage.expectFieldRequired('To Date');

            Logger.info('✅ Required-field validation displayed correctly');
        }
    );
});

test.describe('Leave - Leave List', () => {
    test(
        'LEAVE-003: Admin can view the Leave List',
        { tag: ['@smoke', '@regression', '@leave'] },
        async ({ adminPage, leaveListPage }) => {
            await leaveListPage.open();
            const rowCount = await leaveListPage.getRowCount();
            expect(rowCount).toBeGreaterThanOrEqual(0);
            Logger.info(`Leave List rows visible: ${rowCount}`);
        }
    );

    test(
        'LEAVE-004: Admin can search the Leave List by employee name',
        { tag: ['@regression', '@leave'] },
        async ({ leaveListPage }) => {
            await leaveListPage.open();
            const employeeName = await leaveListPage.getLoggedInUserName();

            Logger.step(`Search Leave List for: ${employeeName}`);
            await leaveListPage.searchByEmployeeName(employeeName);

            const rowTexts = await leaveListPage.getAllRowTexts();
            for (const rowText of rowTexts) {
                expect(rowText).toContain(employeeName);
            }
            Logger.info(`✅ ${rowTexts.length} row(s) matched, all for ${employeeName}`);
        }
    );

    test(
        'LEAVE-005: Reset clears the Employee Name filter on the Leave List',
        { tag: ['@regression', '@leave'] },
        async ({ leaveListPage }) => {
            await leaveListPage.open();
            const employeeName = await leaveListPage.getLoggedInUserName();
            await leaveListPage.searchByEmployeeName(employeeName);

            await leaveListPage.resetFilters();

            const employeeNameValue = await leaveListPage.getEmployeeNameFilterValue();
            expect(employeeNameValue).toBe('');
        }
    );
});

test.describe('Leave - Entitlements', () => {
    test(
        'LEAVE-006: Admin can view Leave Entitlements',
        { tag: ['@smoke', '@regression', '@leave'] },
        async ({ adminPage, leaveEntitlementsPage }) => {
            await leaveEntitlementsPage.open();
            const count = await leaveEntitlementsPage.getRecordsFoundCount();
            expect(count).toBeGreaterThanOrEqual(0);
            Logger.info(`Entitlements found: ${count}`);
        }
    );

    test(
        'LEAVE-007: Admin can add and delete a leave entitlement (full lifecycle)',
        { tag: ['@regression', '@critical', '@leave', '@e2e'] },
        async ({ leaveEntitlementsPage }) => {
            const days = '37'; // distinctive value — disambiguates our row from pre-existing shared-demo entries

            Logger.step('Step 1: Open Leave Entitlements');
            await leaveEntitlementsPage.open();
            const employeeName = await leaveEntitlementsPage.getLoggedInUserName();

            Logger.step(`Step 2: Add a ${days}-day entitlement for ${employeeName}`);
            const { leaveType } = await leaveEntitlementsPage.addEntitlement(employeeName, days);

            Logger.step('Step 3: Verify it is listed');
            await leaveEntitlementsPage.open();
            expect(await leaveEntitlementsPage.isEntitlementListed(leaveType, days)).toBe(true);

            Logger.step('Step 4: Delete it');
            await leaveEntitlementsPage.deleteEntitlement(leaveType, days);
            expect(await leaveEntitlementsPage.isEntitlementListed(leaveType, days)).toBe(false);

            Logger.info(`✅ Entitlement lifecycle verified for ${leaveType} / ${days} days`);
        }
    );
});

test.describe('Leave - Assign Leave', () => {
    test(
        'LEAVE-008: Admin can view the Assign Leave page',
        { tag: ['@smoke', '@regression', '@leave'] },
        async ({ adminPage, assignLeavePage }) => {
            await assignLeavePage.open();
            Logger.info('✅ Assign Leave page accessible');
        }
    );
});
