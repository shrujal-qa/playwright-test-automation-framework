import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { URLS } from '../../../config/urls';
import { MESSAGES } from '../../data/constants/messages';
import type { SystemUserRole, SystemUserStatus } from '../../data/constants/admin-constants';

export type SystemUserFormData = {
    userRole: SystemUserRole;
    employeeName: string;
    status: SystemUserStatus;
    username: string;
    password?: string;
    confirmPassword?: string;
};

export class UserManagementPage extends BasePage {
    private readonly addButton: Locator;
    private readonly searchButton: Locator;
    private readonly resetButton: Locator;
    private readonly saveButton: Locator;
    private readonly cancelButton: Locator;
    private readonly confirmDeleteButton: Locator;
    private readonly cancelDeleteButton: Locator;
    private readonly recordsFoundText: Locator;
    private readonly tableRows: Locator;

    constructor(page: Page) {
        super(page);

        this.addButton = page.getByRole('button', { name: 'Add' });
        this.searchButton = page.getByRole('button', { name: 'Search' });
        this.resetButton = page.getByRole('button', { name: 'Reset' });
        this.saveButton = page.getByRole('button', { name: 'Save' });
        this.cancelButton = page.getByRole('button', { name: 'Cancel' });
        this.confirmDeleteButton = page.getByRole('button', { name: /yes, delete/i });
        this.cancelDeleteButton = page.getByRole('button', { name: /no, cancel/i });
        this.recordsFoundText = page.getByText(/\(\d+\) Records? Found/);
        this.tableRows = page.locator('.oxd-table-card');
    }

    /* ---------------------------
       Navigation
    ---------------------------- */

    async openUserList() {
        await this.goto(URLS.ADMIN_USER_LIST);
        await this.expectVisible(this.addButton);
        await this.waitForTableLoad();
    }

    /* ---------------------------
       Filter / Search
    ---------------------------- */

    async searchByUsername(username: string) {
        await this.stableFill(this.inputByLabel('Username'), username);
        await this.click(this.searchButton);
        await this.waitForTableLoad();
    }

    async searchByUserRole(role: SystemUserRole) {
        await this.selectDropdownOption(this.selectByLabel('User Role'), role);
        await this.click(this.searchButton);
        await this.waitForTableLoad();
    }

    async searchByStatus(status: SystemUserStatus) {
        await this.selectDropdownOption(this.selectByLabel('Status'), status);
        await this.click(this.searchButton);
        await this.waitForTableLoad();
    }

    async searchByEmployeeName(employeeName: string) {
        await this.selectAutocompleteOption(this.inputByLabel('Employee Name'), employeeName, employeeName);
        await this.click(this.searchButton);
        await this.waitForTableLoad();
    }

    async resetFilters() {
        await this.click(this.resetButton);
        await this.waitForTableLoad();
    }

    /* ---------------------------
       Add / Edit User
    ---------------------------- */

    async openAddUserForm() {
        await this.click(this.addButton);
        await this.expectVisible(this.page.getByText('Add User', { exact: true }));
    }

    async openEditUserForm(username: string) {
        await this.rowByUsername(username).locator('button:has(i.bi-pencil-fill)').click();
        await this.expectVisible(this.page.getByText('Edit User', { exact: true }));
    }

    async fillUserForm(data: Partial<SystemUserFormData>) {
        if (data.userRole) {
            await this.selectDropdownOption(this.selectByLabel('User Role'), data.userRole);
        }
        if (data.employeeName) {
            await this.selectAutocompleteOption(
                this.inputByLabel('Employee Name'),
                data.employeeName,
                data.employeeName
            );
        }
        if (data.status) {
            await this.selectDropdownOption(this.selectByLabel('Status'), data.status);
        }
        if (data.username !== undefined) {
            await this.stableFill(this.inputByLabel('Username'), data.username);
        }
        if (data.password !== undefined) {
            await this.stableFill(this.inputByLabel('Password'), data.password);
        }
        if (data.confirmPassword !== undefined) {
            await this.stableFill(this.inputByLabel('Confirm Password'), data.confirmPassword);
        }
    }

    async save() {
        await this.click(this.saveButton);
    }

    async cancelForm() {
        await this.click(this.cancelButton);
    }

    async createUser(data: SystemUserFormData) {
        await this.openAddUserForm();
        await this.fillUserForm(data);
        await this.save();
        await this.expectToast(MESSAGES.SUCCESSFULLY_SAVED);
    }

    /* ---------------------------
       Delete
    ---------------------------- */

    async deleteUserByUsername(username: string) {
        await this.rowByUsername(username).locator('button:has(i.bi-trash)').click();
        await this.expectVisible(this.page.getByText('Are you Sure?'));
        await this.click(this.confirmDeleteButton);
        await this.expectToast(MESSAGES.SUCCESSFULLY_DELETED);
    }

    async cancelDeleteUser(username: string) {
        await this.rowByUsername(username).locator('button:has(i.bi-trash)').click();
        await this.click(this.cancelDeleteButton);
    }

    /* ---------------------------
       Row / table helpers
    ---------------------------- */

    private rowByUsername(username: string): Locator {
        return this.tableRows.filter({ hasText: username }).first();
    }

    async isUserListed(username: string): Promise<boolean> {
        return (await this.rowByUsername(username).count()) > 0;
    }

    async getRowCount(): Promise<number> {
        return this.tableRows.count();
    }

    async getRecordsFoundCount(): Promise<number> {
        const text = await this.recordsFoundText.textContent();
        const match = text?.match(/\((\d+)\)/);
        return match ? Number(match[1]) : 0;
    }

    /* ---------------------------
       Assertions
    ---------------------------- */

    async expectFieldRequired(label: string) {
        await this.expectVisible(this.fieldErrorByLabel(label));
        await expect(this.fieldErrorByLabel(label)).toHaveText(MESSAGES.REQUIRED);
    }

    async expectUsernameAlreadyExists() {
        await expect(this.fieldErrorByLabel('Username')).toHaveText(MESSAGES.USERNAME_ALREADY_EXISTS);
    }

    async expectPasswordMismatch() {
        await expect(this.fieldErrorByLabel('Confirm Password')).toHaveText(MESSAGES.PASSWORDS_DO_NOT_MATCH);
    }

    async expectEmployeeNameInvalid() {
        await expect(this.fieldErrorByLabel('Employee Name')).toHaveText(MESSAGES.INVALID);
    }

    /** Types free text into Employee Name without selecting a suggestion (for negative "Invalid" testing). */
    async typeEmployeeNameFreeText(text: string) {
        await this.inputByLabel('Employee Name').fill(text);
    }
}
