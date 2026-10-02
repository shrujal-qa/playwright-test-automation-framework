import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { URLS } from '../../../config/urls';

export class LeaveListPage extends BasePage {
    private readonly searchButton: Locator;
    private readonly resetButton: Locator;
    private readonly recordsFoundText: Locator;
    private readonly tableRows: Locator;

    constructor(page: Page) {
        super(page);

        this.searchButton = page.getByRole('button', { name: 'Search' });
        this.resetButton = page.getByRole('button', { name: 'Reset' });
        this.recordsFoundText = page.getByText(/\(\d+\) Records? Found/);
        this.tableRows = page.locator('.oxd-table-card');
    }

    /* ---------------------------
       Navigation
    ---------------------------- */

    async open() {
        await this.goto(URLS.LEAVE_LIST);
        await this.expectVisible(this.searchButton);
        await this.waitForTableLoad();
    }

    /* ---------------------------
       Filter / Search
    ---------------------------- */

    async searchByEmployeeName(name: string) {
        await this.selectAutocompleteOption(this.inputByLabel('Employee Name'), name, name);
        await this.click(this.searchButton);
        await this.waitForTableLoad();
    }

    async resetFilters() {
        await this.click(this.resetButton);
        await this.waitForTableLoad();
    }

    async getEmployeeNameFilterValue(): Promise<string> {
        return this.inputByLabel('Employee Name').inputValue();
    }

    /* ---------------------------
       Table helpers
    ---------------------------- */

    async getRowCount(): Promise<number> {
        return this.tableRows.count();
    }

    async getRecordsFoundCount(): Promise<number> {
        const text = await this.recordsFoundText.textContent();
        const match = text?.match(/\((\d+)\)/);
        return match ? Number(match[1]) : 0;
    }

    async getAllRowTexts(): Promise<string[]> {
        return this.tableRows.allTextContents();
    }
}
