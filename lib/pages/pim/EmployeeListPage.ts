import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { URLS } from '../../../config/urls';
import { MESSAGES } from '../../data/constants/messages';

export class EmployeeListPage extends BasePage {
    private readonly addEmployeeTab: Locator;
    private readonly searchButton: Locator;
    private readonly resetButton: Locator;
    private readonly confirmDeleteButton: Locator;
    private readonly recordsFoundText: Locator;
    private readonly tableRows: Locator;

    constructor(page: Page) {
        super(page);

        this.addEmployeeTab = page.getByRole('link', { name: 'Add Employee' });
        this.searchButton = page.getByRole('button', { name: 'Search' });
        this.resetButton = page.getByRole('button', { name: 'Reset' });
        this.confirmDeleteButton = page.getByRole('button', { name: /yes, delete/i });
        this.recordsFoundText = page.getByText(/\(\d+\) Records? Found/);
        this.tableRows = page.locator('.oxd-table-card');
    }

    /* ---------------------------
       Navigation
    ---------------------------- */

    async open() {
        await this.goto(URLS.PIM_EMPLOYEE_LIST);
        await this.expectVisible(this.addEmployeeTab);
        await this.waitForTableLoad();
    }

    async goToAddEmployee() {
        await this.click(this.addEmployeeTab);
    }

    /* ---------------------------
       Filter / Search
    ---------------------------- */

    async searchByEmployeeName(name: string) {
        await this.selectAutocompleteOption(this.inputByLabel('Employee Name'), name, name);
        await this.click(this.searchButton);
        await this.waitForTableLoad();
    }

    async searchByEmployeeId(employeeId: string) {
        await this.stableFill(this.inputByLabel('Employee Id'), employeeId);
        await this.click(this.searchButton);
        await this.waitForTableLoad();
    }

    async searchByEmploymentStatus(status: string) {
        await this.selectDropdownOption(this.selectByLabel('Employment Status'), status);
        await this.click(this.searchButton);
        await this.waitForTableLoad();
    }

    async resetFilters() {
        await this.click(this.resetButton);
        await this.waitForTableLoad();
    }

    /* ---------------------------
       Delete
    ---------------------------- */

    async deleteEmployeeByName(displayName: string) {
        await this.rowByText(displayName).locator('button:has(i.bi-trash)').click();
        await this.expectVisible(this.page.getByText('Are you Sure?'));
        await this.click(this.confirmDeleteButton);
        await this.expectToast(MESSAGES.SUCCESSFULLY_DELETED);
    }

    async openEmployeeByName(displayName: string) {
        await this.rowByText(displayName).locator('button:has(i.bi-pencil-fill)').click();
    }

    /* ---------------------------
       Row / table helpers
    ---------------------------- */

    private rowByText(text: string): Locator {
        return this.tableRows.filter({ hasText: text }).first();
    }

    async isEmployeeListed(text: string): Promise<boolean> {
        return (await this.rowByText(text).count()) > 0;
    }

    async getRowCount(): Promise<number> {
        return this.tableRows.count();
    }

    async getRecordsFoundCount(): Promise<number> {
        const text = await this.recordsFoundText.textContent();
        const match = text?.match(/\((\d+)\)/);
        return match ? Number(match[1]) : 0;
    }

    /** All visible rows' full text (id, name, job title, status, …) — useful for asserting filter invariants. */
    async getAllRowTexts(): Promise<string[]> {
        return this.tableRows.allTextContents();
    }
}
