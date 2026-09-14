import type { Page } from '@playwright/test';
import { test } from '../../../lib/fixtures';
import { ApplyLeavePage } from '../../../lib/pages/leave/ApplyLeavePage';
import { MyLeavePage } from '../../../lib/pages/leave/MyLeavePage';
import { LeaveListPage } from '../../../lib/pages/leave/LeaveListPage';
import { DataGenerator } from '../../../lib/utils/DataGenerator';
import { Logger } from '../../../lib/utils/Logger';

/**
 * Leave Module Test Suite
 *
 * Covers applying for leave, viewing it in My Leave, cancelling a pending
 * request, and the Admin-facing Leave List search/filter flows.
 *
 * Leave dates are generated far enough in the future (DataGenerator.date)
 * that they never collide with another run's in-flight leave request on
 * the shared demo instance.
 */

/**
 * Applies for leave, trying every available Leave Type in turn until one is
 * confirmed in My Leave. The demo account's per-type leave balance is
 * outside test control — a type can be silently rejected for insufficient
 * balance — so success is verified structurally (the row appears in My
 * Leave) rather than by trusting a save-confirmation toast.
 */
async function applyForAvailableLeaveType(page: Page, fromDate: string, toDate: string): Promise<string> {
    const applyLeave = new ApplyLeavePage(page);
    const myLeave = new MyLeavePage(page);

    await applyLeave.open();
    const leaveTypes = await applyLeave.listLeaveTypeOptions();

    for (const leaveType of leaveTypes) {
        await applyLeave.open();
        await applyLeave.selectLeaveTypeByText(leaveType);
        await applyLeave.setDateRange(fromDate, toDate);
        await applyLeave.apply();

        await myLeave.open();
        await myLeave.searchByDateRange(fromDate, toDate);
        if (await myLeave.hasLeaveRequest(leaveType)) {
            return leaveType;
        }
    }

    throw new Error(
        `Could not apply for leave with any available leave type (tried: ${leaveTypes.join(', ')}). ` +
            'This usually means the demo account has no remaining balance for any leave type.'
    );
}

test.describe('Leave Tests - Apply Leave', () => {
    test(
        'LEAVE-001: User can navigate to Apply Leave page',
        { tag: ['@smoke', '@regression'] },
        async ({ userPage, page }, testInfo) => {
            testInfo.annotations.push(
                { type: 'severity', description: 'critical' },
                { type: 'feature', description: 'Leave' }
            );

            Logger.step('Step 1: Navigate to Apply Leave');
            const applyLeave = new ApplyLeavePage(page);
            await applyLeave.open();

            Logger.step('Step 2: Verify Apply Leave form is displayed');
            await applyLeave.verifyStillOnApplyLeaveForm();

            Logger.info('✅ Apply Leave page accessible');
        }
    );

    test(
        'LEAVE-002: User can apply for leave successfully',
        { tag: ['@smoke', '@regression', '@critical'] },
        async ({ userPage, page }, testInfo) => {
            testInfo.annotations.push(
                { type: 'severity', description: 'critical' },
                { type: 'feature', description: 'Leave' },
                { type: 'story', description: 'LEAVE-002: Apply for leave' }
            );

            const fromDate = DataGenerator.date(60);
            const toDate = DataGenerator.date(60);

            Logger.step('Step 1: Apply for leave, trying leave types until one has balance');
            const leaveType = await applyForAvailableLeaveType(page, fromDate, toDate);

            Logger.info(`✅ Leave applied successfully (${leaveType}) for ${fromDate} - ${toDate}`);
        }
    );

    test(
        'LEAVE-101: Apply Leave fails when Leave Type is not selected',
        { tag: ['@regression', '@validation'] },
        async ({ userPage, page }, testInfo) => {
            testInfo.annotations.push(
                { type: 'severity', description: 'normal' },
                { type: 'feature', description: 'Leave' }
            );

            const fromDate = DataGenerator.date(61);
            const toDate = DataGenerator.date(61);

            Logger.step('Step 1: Navigate to Apply Leave');
            const applyLeave = new ApplyLeavePage(page);
            await applyLeave.open();

            Logger.step('Step 2: Fill only the date range, leaving Leave Type unselected');
            await applyLeave.setDateRange(fromDate, toDate);
            await applyLeave.apply();

            Logger.step('Step 3: Verify Required validation is shown for Leave Type');
            await applyLeave.verifyRequiredFieldError();

            Logger.info('✅ Apply Leave correctly rejects a missing Leave Type');
        }
    );

    test(
        'LEAVE-102: Apply Leave rejects a To Date before the From Date',
        { tag: ['@regression', '@negative'] },
        async ({ userPage, page }, testInfo) => {
            testInfo.annotations.push(
                { type: 'severity', description: 'normal' },
                { type: 'feature', description: 'Leave' }
            );

            const fromDate = DataGenerator.date(70);
            const toDate = DataGenerator.date(65); // before fromDate — invalid range

            Logger.step('Step 1: Navigate to Apply Leave');
            const applyLeave = new ApplyLeavePage(page);
            await applyLeave.open();

            Logger.step('Step 2: Select a leave type and an invalid (reversed) date range');
            await applyLeave.selectFirstAvailableLeaveType();
            await applyLeave.setDateRange(fromDate, toDate);
            await applyLeave.apply();

            Logger.step('Step 3: Verify the request was rejected — the form stays displayed, no success toast');
            await applyLeave.verifyStillOnApplyLeaveForm();

            Logger.info('✅ Apply Leave correctly rejects an invalid date range');
        }
    );
});

test.describe('Leave Tests - My Leave', () => {
    test(
        'LEAVE-003: User can view a submitted leave request in My Leave',
        { tag: ['@regression'] },
        async ({ userPage, page }, testInfo) => {
            testInfo.annotations.push(
                { type: 'severity', description: 'normal' },
                { type: 'feature', description: 'Leave' }
            );

            const fromDate = DataGenerator.date(75);
            const toDate = DataGenerator.date(75);

            Logger.step('Step 1: Apply for leave, trying leave types until one has balance');
            const leaveType = await applyForAvailableLeaveType(page, fromDate, toDate);

            Logger.step('Step 2: Re-open My Leave and search for the same date range');
            const myLeave = new MyLeavePage(page);
            await myLeave.open();
            await myLeave.searchByDateRange(fromDate, toDate);

            Logger.step('Step 3: Verify the leave request appears with Pending Approval status');
            await myLeave.verifyLeaveRequestVisible(leaveType);
            await myLeave.verifyLeaveRequestHasStatus(leaveType, 'Pending Approval');

            Logger.info(`✅ Leave request for ${leaveType} visible in My Leave`);
        }
    );

    test(
        'LEAVE-004: User can cancel a pending leave request',
        { tag: ['@regression', '@critical'] },
        async ({ userPage, page }, testInfo) => {
            testInfo.annotations.push(
                { type: 'severity', description: 'critical' },
                { type: 'feature', description: 'Leave' },
                { type: 'story', description: 'LEAVE-004: Cancel pending leave' }
            );

            const fromDate = DataGenerator.date(80);
            const toDate = DataGenerator.date(80);

            Logger.step('Step 1: Apply for leave, trying leave types until one has balance');
            const leaveType = await applyForAvailableLeaveType(page, fromDate, toDate);

            Logger.step('Step 2: Re-open My Leave and locate the request');
            const myLeave = new MyLeavePage(page);
            await myLeave.open();
            await myLeave.searchByDateRange(fromDate, toDate);
            await myLeave.verifyLeaveRequestVisible(leaveType);

            Logger.step('Step 3: Cancel the pending leave request');
            await myLeave.cancelLeaveContaining(leaveType);

            Logger.step('Step 4: Verify the request no longer appears as Pending Approval');
            await myLeave.searchByDateRange(fromDate, toDate);
            await myLeave.verifyLeaveRequestNotVisible(leaveType);

            Logger.info(`✅ Leave request for ${leaveType} cancelled successfully`);
        }
    );
});

test.describe('Leave Tests - Admin Leave List', () => {
    test(
        'LEAVE-005: Admin can view and search the Leave List',
        { tag: ['@regression'] },
        async ({ adminPage, page }, testInfo) => {
            testInfo.annotations.push(
                { type: 'severity', description: 'normal' },
                { type: 'feature', description: 'Leave' }
            );

            Logger.step('Step 1: Navigate to the Leave List');
            const leaveList = new LeaveListPage(page);
            await leaveList.open();

            Logger.step('Step 2: Verify the Leave List page has loaded');
            await leaveList.verifyListLoaded();

            Logger.step('Step 3: Trigger a search with default filters');
            await leaveList.search();

            Logger.info('✅ Admin can access and search the Leave List');
        }
    );

    test(
        'LEAVE-006: Admin can filter Leave List by Pending Approval status',
        { tag: ['@regression'] },
        async ({ adminPage, page }, testInfo) => {
            testInfo.annotations.push(
                { type: 'severity', description: 'normal' },
                { type: 'feature', description: 'Leave' }
            );

            Logger.step('Step 1: Navigate to the Leave List');
            const leaveList = new LeaveListPage(page);
            await leaveList.open();

            Logger.step('Step 2: Filter by "Pending Approval" status');
            await leaveList.filterByStatus('Pending Approval');

            Logger.step('Step 3: Verify the Leave List page remains displayed');
            await leaveList.verifyListLoaded();

            Logger.info('✅ Admin can filter the Leave List by status');
        }
    );
});
