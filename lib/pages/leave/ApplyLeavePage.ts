import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { URLS } from '../../../config/urls';
import { toLeaveDateFormat } from './dateFormat';

export class ApplyLeavePage extends BasePage {
    private readonly leaveTypeDropdown: Locator;
    private readonly fromDateInput: Locator;
    private readonly toDateInput: Locator;
    private readonly applyButton: Locator;
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

    /**
     * Lists every Leave Type option without selecting one. Used by tests
     * that need to try several types in turn — the demo account's leave
     * balance per type is outside test control, so a type that looks valid
     * can still be rejected by the backend for having zero entitlement.
     */
    async listLeaveTypeOptions(): Promise<string[]> {
        await this.click(this.leaveTypeDropdown);
        const options = this.page.locator('.oxd-select-dropdown [role="option"], .oxd-select-dropdown > div');
        const count = await options.count();
        const texts: string[] = [];
        for (let i = 0; i < count; i++) {
            texts.push((await options.nth(i).textContent())?.trim() ?? '');
        }
        await this.page.keyboard.press('Escape');
        return texts.filter(Boolean);
    }

    async selectLeaveTypeByText(leaveType: string) {
        await this.click(this.leaveTypeDropdown);
        await this.page.locator('.oxd-select-dropdown').getByText(leaveType, { exact: true }).click();
    }

    /**
     * These date inputs have their own input mask that fights with both
     * `stableFill`'s keystroke typing and a plain `Locator.fill` (both have
     * been observed corrupting/duplicating the value in CI — e.g. setting
     * To Date right after From Date leaving "2026-13-112026-13-11"). Most
     * likely an auto-copy-from-From-Date reaction on this widget racing the
     * fill. Clears explicitly via keyboard first and retries the whole
     * operation if the value still doesn't match.
     */
    private async fillDateField(locator: Locator, value: string, maxAttempts = 3) {
        await locator.waitFor({ state: 'visible' });
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            await locator.click();
            await locator.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A');
            await locator.press('Delete');
            await locator.fill(value);
            const matches = await locator
                .inputValue()
                .then((actual) => actual === value)
                .catch(() => false);
            if (matches) return;
            if (attempt < maxAttempts) {
                await this.page.waitForTimeout(300);
            }
        }
        await expect(locator).toHaveValue(value, { timeout: 5_000 });
    }

    async setDateRange(fromDate: string, toDate: string) {
        await this.fillDateField(this.fromDateInput, toLeaveDateFormat(fromDate));
        // Give the widget a moment to settle any auto-copy reaction to the
        // From Date change before filling To Date.
        await this.page.waitForTimeout(500);
        await this.fillDateField(this.toDateInput, toLeaveDateFormat(toDate));
    }

    async apply() {
        await this.click(this.applyButton);
        // Give the apply request (and any resulting redirect) time to
        // settle before the caller navigates away — a toast is too
        // transient to rely on as that signal.
        await this.page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => undefined);
    }

    /* ---------------------------
       Assertions
    ---------------------------- */

    async verifyRequiredFieldError() {
        await this.expectVisible(this.requiredFieldError, 'Required field validation should be visible');
    }

    async verifyStillOnApplyLeaveForm() {
        await this.expectVisible(this.applyButton, 'Apply Leave form should still be displayed');
    }
}
