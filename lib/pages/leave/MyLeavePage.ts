import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { URLS } from '../../../config/urls';

export class MyLeavePage extends BasePage {
    private readonly fromDateInput: Locator;
    private readonly toDateInput: Locator;
    private readonly searchButton: Locator;
    private readonly tableRows: Locator;
    private readonly confirmCancelButton: Locator;

    constructor(page: Page) {
        super(page);

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
        this.searchButton = page.getByRole('button', { name: /search/i });
        this.tableRows = page.locator('.oxd-table-card');
        this.confirmCancelButton = page.getByRole('button', { name: /yes, cancel/i });
    }

    /* ---------------------------
       Actions
    ---------------------------- */

    async open() {
        await this.goto(URLS.LEAVE_MY_LEAVE);
    }

    async searchByDateRange(fromDate: string, toDate: string) {
        await this.stableFill(this.fromDateInput, fromDate);
        await this.stableFill(this.toDateInput, toDate);
        await this.click(this.searchButton);
    }

    async cancelLeaveContaining(text: string) {
        const row = this.tableRows.filter({ hasText: text }).first();
        await row.getByRole('button', { name: /cancel/i }).click();
        await this.click(this.confirmCancelButton);
    }

    /* ---------------------------
       Assertions
    ---------------------------- */

    async verifyLeaveRequestVisible(text: string) {
        await this.expectVisible(
            this.tableRows.filter({ hasText: text }).first(),
            `Leave request containing "${text}" should be visible in My Leave`
        );
    }

    async verifyLeaveRequestHasStatus(text: string, status: string) {
        const row = this.tableRows.filter({ hasText: text }).first();
        await this.expectVisible(row.getByText(status), `Leave request should be in "${status}" status`);
    }

    async verifyLeaveRequestNotVisible(text: string) {
        const row = this.tableRows.filter({ hasText: text });
        await row.first().waitFor({ state: 'detached' });
    }
}
