import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { URLS } from '../../../config/urls';
import { MESSAGES } from '../../data/constants/messages';

export class ApplyLeavePage extends BasePage {
    private readonly leaveTypeDropdown: Locator;
    private readonly fromDateInput: Locator;
    private readonly toDateInput: Locator;
    private readonly applyButton: Locator;
    private readonly successToast: Locator;
    private readonly requiredFieldError: Locator;

    constructor(page: Page) {
        super(page);

        this.leaveTypeDropdown = page
            .locator('.oxd-input-group')
            .filter({ hasText: 'Leave Type' })
            .locator('.oxd-select-text');
        this.fromDateInput = page
            .locator('.oxd-input-group')
            .filter({ hasText: 'From Date' })
            .locator('input')
            .first();
        this.toDateInput = page
            .locator('.oxd-input-group')
            .filter({ hasText: 'To Date' })
            .locator('input')
            .first();
        this.applyButton = page.getByRole('button', { name: /apply/i });
        this.successToast = page.getByText(MESSAGES.SUCCESSFULLY_SAVED);
        this.requiredFieldError = page.getByText('Required').first();
    }

    /* ---------------------------
       Actions
    ---------------------------- */

    async open() {
        await this.goto(URLS.LEAVE_APPLY);
    }

    /**
     * Selects whichever Leave Type happens to be first in the dropdown.
     * The demo's configured leave types vary over time, so tests that only
     * need *a* valid leave type (rather than a specific one) should prefer
     * this over hard-coding a name.
     */
    async selectFirstAvailableLeaveType(): Promise<string> {
        await this.click(this.leaveTypeDropdown);
        const firstOption = this.page.locator('.oxd-select-dropdown [role="option"], .oxd-select-dropdown > div').first();
        await firstOption.waitFor({ state: 'visible' });
        const text = (await firstOption.textContent())?.trim() ?? '';
        await firstOption.click();
        return text;
    }

    async setDateRange(fromDate: string, toDate: string) {
        await this.stableFill(this.fromDateInput, fromDate);
        await this.stableFill(this.toDateInput, toDate);
    }

    async apply() {
        await this.click(this.applyButton);
    }

    /* ---------------------------
       Assertions
    ---------------------------- */

    async verifyLeaveApplied() {
        await this.expectVisible(this.successToast, 'Leave application should show a success toast');
    }

    async verifyRequiredFieldError() {
        await this.expectVisible(this.requiredFieldError, 'Required field validation should be visible');
    }

    async verifyStillOnApplyLeaveForm() {
        await this.expectVisible(this.applyButton, 'Apply Leave form should still be displayed');
    }
}
