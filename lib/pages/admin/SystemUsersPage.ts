import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { URLS } from '../../../config/urls';
import { MESSAGES } from '../../data/constants/messages';

export class SystemUsersPage extends BasePage {
    private readonly addButton: Locator;
    private readonly usernameFilterInput: Locator;
    private readonly resetButton: Locator;
    private readonly searchButton: Locator;
    private readonly tableRows: Locator;
    private readonly noRecordsText: Locator;
    private readonly confirmDeleteButton: Locator;
    private readonly statusToggleDropdown: Locator;
    private readonly saveButton: Locator;
    private readonly successToast: Locator;

    constructor(page: Page) {
        super(page);

        this.addButton = page.getByRole('button', { name: /add/i });
        this.usernameFilterInput = page
            .locator('.oxd-input-group')
            .filter({ hasText: 'Username' })
            .locator('input');
        this.resetButton = page.getByRole('button', { name: /reset/i });
        this.searchButton = page.getByRole('button', { name: /search/i });
        this.tableRows = page.locator('.oxd-table-card');
        this.noRecordsText = page.getByText(MESSAGES.NO_RECORDS_FOUND);
        this.confirmDeleteButton = page.getByRole('button', { name: /yes, delete/i });
        this.statusToggleDropdown = page
            .locator('.oxd-input-group')
            .filter({ hasText: 'Status' })
            .locator('.oxd-select-text');
        this.saveButton = page.getByRole('button', { name: /save/i });
        this.successToast = page.getByText(MESSAGES.SUCCESSFULLY_UPDATED);
    }

    /* ---------------------------
       Actions
    ---------------------------- */

    async open() {
        await this.goto(URLS.ADMIN_USERS);
    }

    async clickAddUser() {
        await this.click(this.addButton);
    }

    async searchByUsername(username: string) {
        await this.stableFill(this.usernameFilterInput, username);
        await this.click(this.searchButton);
    }

    async resetFilters() {
        await this.click(this.resetButton);
    }

    async openUserByUsername(username: string) {
        await this.tableRows.filter({ hasText: username }).first().click();
    }

    async changeStatusForRow(status: string) {
        await this.selectDropdownOption(this.statusToggleDropdown, status);
        await this.click(this.saveButton);
    }

    async deleteUserByUsername(username: string) {
        const row = this.tableRows.filter({ hasText: username }).first();
        await row.locator('.bi-trash, [class*="trash"]').click();
        await this.click(this.confirmDeleteButton);
    }

    /* ---------------------------
       Assertions
    ---------------------------- */

    async verifyListLoaded() {
        await this.expectVisible(this.page.getByText('System Users', { exact: true }));
    }

    async verifyRowVisible(username: string) {
        await this.expectVisible(
            this.tableRows.filter({ hasText: username }).first(),
            `System user row for ${username} should be visible`
        );
    }

    async verifyNoRecordsFound() {
        await this.expectVisible(this.noRecordsText, 'No Records Found should be shown for an unmatched search');
    }

    async verifyStatusUpdated() {
        await this.expectVisible(this.successToast, 'Successfully Updated toast should appear after saving');
    }
}
