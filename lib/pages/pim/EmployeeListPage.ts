import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { URLS } from '../../../config/urls';
import { MESSAGES } from '../../data/constants/messages';

export class EmployeeListPage extends BasePage {
    private readonly addButton: Locator;
    private readonly employeeNameInput: Locator;
    private readonly employeeIdFilterInput: Locator;
    private readonly resetButton: Locator;
    private readonly searchButton: Locator;
    private readonly tableRows: Locator;
    private readonly noRecordsText: Locator;
    private readonly confirmDeleteButton: Locator;

    constructor(page: Page) {
        super(page);

        this.addButton = page.getByRole('button', { name: /add/i });
        this.employeeNameInput = page.getByPlaceholder('Type for hints...').first();
        this.employeeIdFilterInput = page
            .locator('.oxd-input-group')
            .filter({ hasText: 'Employee Id' })
            .locator('input');
        this.resetButton = page.getByRole('button', { name: /reset/i });
        this.searchButton = page.getByRole('button', { name: /search/i });
        this.tableRows = page.locator('.oxd-table-card');
        this.noRecordsText = page.getByText(MESSAGES.NO_RECORDS_FOUND);
        this.confirmDeleteButton = page.getByRole('button', { name: /yes, delete/i });
    }

    /* ---------------------------
       Actions
    ---------------------------- */

    async open() {
        await this.goto(URLS.PIM);
    }

    async clickAddEmployee() {
        await this.click(this.addButton);
    }

    async searchByEmployeeName(name: string) {
        await this.selectAutocompleteOption(this.employeeNameInput, name);
        await this.click(this.searchButton);
    }

    /**
     * Employee Id is a plain text filter (not an autocomplete), so it is
     * the most reliable way to force a guaranteed "no match" search.
     */
    async searchByEmployeeId(employeeId: string) {
        await this.stableFill(this.employeeIdFilterInput, employeeId);
        await this.click(this.searchButton);
    }

    async resetFilters() {
        await this.click(this.resetButton);
    }

    async deleteRowByName(fullName: string) {
        const row = this.tableRows.filter({ hasText: fullName }).first();
        await row.locator('.bi-trash, [class*="trash"]').click();
        await this.click(this.confirmDeleteButton);
    }

    /* ---------------------------
       Assertions
    ---------------------------- */

    async verifyListLoaded() {
        await this.expectVisible(this.page.getByText('Employee Information', { exact: false }).first());
    }

    async verifyRowVisible(fullName: string) {
        await this.expectVisible(
            this.tableRows.filter({ hasText: fullName }).first(),
            `Employee row for ${fullName} should be visible in the list`
        );
    }

    async verifyNoRecordsFound() {
        await this.expectVisible(this.noRecordsText, 'No Records Found message should be shown for an unmatched search');
    }
}
