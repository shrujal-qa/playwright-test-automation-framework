import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { URLS } from '../../../config/urls';
import { MESSAGES } from '../../data/constants/messages';

export type ApplyLeaveData = {
    fromDate: string;
    toDate?: string;
    comments?: string;
};

export class ApplyLeavePage extends BasePage {
    private readonly leaveTypeSelect: Locator;
    private readonly leaveBalanceText: Locator;
    private readonly applyButton: Locator;

    constructor(page: Page) {
        super(page);

        this.leaveTypeSelect = page.locator('.oxd-select-text').first();
        this.leaveBalanceText = page.getByText(/Day\(s\)/);
        this.applyButton = page.getByRole('button', { name: 'Apply' });
    }

    /* ---------------------------
       Navigation
    ---------------------------- */

    async open() {
        await this.goto(URLS.LEAVE_APPLY);
        await this.expectVisible(this.applyButton);
    }

    /* ---------------------------
       Actions
    ---------------------------- */

    /**
     * Fills From Date; OrangeHRM auto-mirrors it into To Date for a
     * single-day request (confirmed by inspection), so `toDate` is only
     * needed for a multi-day range.
     *
     * Dates use the field's own `yyyy-dd-mm` order — see
     * `DataGenerator.leaveDate()`.
     */
    async fillDates(fromDate: string, toDate?: string) {
        await this.stableFill(this.inputByLabel('From Date'), fromDate);
        if (toDate) {
            await this.stableFill(this.inputByLabel('To Date'), toDate);
        }
    }

    async addComments(text: string) {
        await this.stableFill(this.page.getByRole('textbox').last(), text);
    }

    async submit() {
        await this.click(this.applyButton);
    }

    /**
     * Selects a Leave Type dynamically (never hardcode one — this demo's
     * configured leave types are shared, mutable reference data, exactly
     * like the employee-name issue this framework already hit), applies a
     * single-day leave, and waits for the resulting toast.
     *
     * Note: selecting a Leave Type and a date triggers an async balance /
     * duration lookup. We wait for the balance to move off its "0.00
     * Day(s)" placeholder before submitting — without that wait, the Apply
     * click was observed to silently no-op (no toast, no navigation, no
     * inline error) during manual verification.
     */
    async applyLeave(data: ApplyLeaveData): Promise<{ leaveType: string }> {
        const leaveType = await this.selectFirstDropdownOption(this.leaveTypeSelect);
        await this.fillDates(data.fromDate, data.toDate);
        await expect(this.leaveBalanceText).not.toHaveText('0.00 Day(s)', { timeout: 8_000 }).catch(() => {});

        if (data.comments) {
            await this.addComments(data.comments);
        }

        await this.submit();
        await this.expectToast(MESSAGES.SUCCESSFULLY_SAVED);
        return { leaveType };
    }

    /* ---------------------------
       Assertions
    ---------------------------- */

    async expectFieldRequired(label: 'Leave Type' | 'From Date' | 'To Date') {
        await expect(this.fieldErrorByLabel(label)).toHaveText(MESSAGES.REQUIRED);
    }

    async getLeaveBalanceText(): Promise<string> {
        return (await this.leaveBalanceText.first().textContent())?.trim() ?? '';
    }
}
