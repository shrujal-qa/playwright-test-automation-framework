import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { URLS } from '../../../config/urls';

export class LeaveListPage extends BasePage {
    private readonly statusDropdown: Locator;
    private readonly searchButton: Locator;
    private readonly resetButton: Locator;
    private readonly pageHeading: Locator;
    private readonly recordsFoundText: Locator;
    private readonly tableRows: Locator;

    constructor(page: Page) {
        super(page);

        this.statusDropdown = page
            .locator('.oxd-input-group')
            .filter({ hasText: 'Show Leave with Status' })
            .locator('.oxd-select-text');
        this.searchButton = page.getByRole('button', { name: 'Search' });
        this.resetButton = page.getByRole('button', { name: 'Reset' });
        this.recordsFoundText = page.getByText(/\(\d+\) Records? Found/);
        this.tableRows = page.locator('.oxd-table-card');
        this.pageHeading = page.getByRole('heading', { name: 'Leave List' });
    }

    /* ---------------------------
       Navigation
    ---------------------------- */

    async open() {
        await this.goto(URLS.LEAVE_LIST);
        await this.waitForFormLoader();
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

    /**
     * The status filter is a multi-select that renders chosen values as
     * chips and drops them from its option list, and "Pending Approval" is
     * pre-selected by default — so only pick the option when it isn't
     * already a chip.
     */
    async filterByStatus(status: string) {
        const alreadySelected = await this.page.locator('.oxd-chip', { hasText: status }).count();
        if (!alreadySelected) {
            await this.selectDropdownOption(this.statusDropdown, status);
        }
        await this.click(this.searchButton);
    }

    async search() {
        await this.click(this.searchButton);
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

    /* ---------------------------
       Assertions
    ---------------------------- */

    async verifyListLoaded() {
        await this.expectVisible(this.pageHeading, 'Leave List page should be visible to Admin');
    }
}
