import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { URLS } from '../../../config/urls';
import { MESSAGES } from '../../data/constants/messages';

export class LeaveEntitlementsPage extends BasePage {
    private readonly addButton: Locator;
    private readonly saveButton: Locator;
    private readonly confirmDeleteButton: Locator;
    private readonly recordsFoundText: Locator;
    private readonly tableRows: Locator;

    constructor(page: Page) {
        super(page);

        this.addButton = page.getByRole('button', { name: 'Add' });
        this.saveButton = page.getByRole('button', { name: 'Save' });
        this.confirmDeleteButton = page.getByRole('button', { name: /yes, delete/i });
        this.recordsFoundText = page.getByText(/\(\d+\) Records? Found/);
        this.tableRows = page.locator('.oxd-table-card');
    }

    /* ---------------------------
       Navigation
    ---------------------------- */

    async open() {
        await this.goto(URLS.LEAVE_MY_ENTITLEMENTS);
        await this.expectVisible(this.addButton);
        await this.waitForTableLoad();
    }

    /* ---------------------------
       Add / Delete
    ---------------------------- */

    /**
     * Adds an entitlement for `employeeName`, picking the first available
     * Leave Type and Leave Period dynamically (both are demo-configured
     * reference data — don't hardcode a specific one).
     */
    async addEntitlement(employeeName: string, days: string): Promise<{ leaveType: string }> {
        await this.click(this.addButton);
        await this.expectVisible(this.page.getByText('Add Leave Entitlements', { exact: false }));

        await this.selectAutocompleteOption(this.inputByLabel('Employee Name'), employeeName, employeeName);
        const leaveType = await this.selectFirstDropdownOption(this.selectByLabel('Leave Type'));
        await this.selectFirstDropdownOption(this.selectByLabel('Leave Period'));
        await this.stableFill(this.inputByLabel('Entitlement'), days);

        await this.click(this.saveButton);
        await this.expectToast(MESSAGES.SUCCESSFULLY_SAVED);
        return { leaveType };
    }

    /**
     * Deletes the entitlement matching both `leaveType` and `days`.
     * This table doesn't show an employee column (it's scoped to whichever
     * employee was searched/added), so on a shared demo instance matching
     * on leave type alone risks hitting another tester's pre-existing row
     * of the same type — pass the same distinctive `days` value used in
     * `addEntitlement` to disambiguate.
     */
    async deleteEntitlement(leaveType: string, days: string) {
        await this.rowByLeaveTypeAndDays(leaveType, days).locator('button:has(i.bi-trash)').click();
        await this.expectVisible(this.page.getByText('Are you Sure?'));
        await this.click(this.confirmDeleteButton);
        await this.expectToast(MESSAGES.SUCCESSFULLY_DELETED);
    }

    /* ---------------------------
       Table helpers
    ---------------------------- */

    private rowByLeaveTypeAndDays(leaveType: string, days: string): Locator {
        return this.tableRows.filter({ hasText: leaveType }).filter({ hasText: days }).first();
    }

    async isEntitlementListed(leaveType: string, days: string): Promise<boolean> {
        return (await this.rowByLeaveTypeAndDays(leaveType, days).count()) > 0;
    }

    async getRecordsFoundCount(): Promise<number> {
        const text = await this.recordsFoundText.textContent();
        const match = text?.match(/\((\d+)\)/);
        return match ? Number(match[1]) : 0;
    }
}
