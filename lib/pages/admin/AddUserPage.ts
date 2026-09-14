import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { MESSAGES } from '../../data/constants/messages';

export class AddUserPage extends BasePage {
    private readonly userRoleDropdown: Locator;
    private readonly employeeNameInput: Locator;
    private readonly statusDropdown: Locator;
    private readonly usernameInput: Locator;
    private readonly passwordInput: Locator;
    private readonly confirmPasswordInput: Locator;
    private readonly saveButton: Locator;
    private readonly requiredFieldError: Locator;
    private readonly passwordMismatchError: Locator;

    constructor(page: Page) {
        super(page);

        this.userRoleDropdown = page
            .locator('.oxd-input-group')
            .filter({ hasText: 'User Role' })
            .locator('.oxd-select-text');
        this.employeeNameInput = page.getByPlaceholder('Type for hints...');
        this.statusDropdown = page
            .locator('.oxd-input-group')
            .filter({ hasText: 'Status' })
            .locator('.oxd-select-text');
        this.usernameInput = page
            .locator('.oxd-input-group')
            .filter({ hasText: 'Username' })
            .locator('input');
        this.passwordInput = page.locator('input[type="password"]').first();
        this.confirmPasswordInput = page.locator('input[type="password"]').last();
        this.saveButton = page.getByRole('button', { name: /save/i });
        this.requiredFieldError = page.getByText('Required').first();
        this.passwordMismatchError = page.getByText(MESSAGES.PASSWORDS_DO_NOT_MATCH);
    }

    /* ---------------------------
       Actions
    ---------------------------- */

    async selectUserRole(role: string) {
        await this.selectDropdownOption(this.userRoleDropdown, role);
    }

    async selectEmployee(employeeName: string) {
        await this.selectAutocompleteOption(this.employeeNameInput, employeeName);
    }

    async selectStatus(status: string) {
        await this.selectDropdownOption(this.statusDropdown, status);
    }

    async fillCredentials(username: string, password: string, confirmPassword = password) {
        await this.stableFill(this.usernameInput, username);
        await this.stableFill(this.passwordInput, password);
        await this.stableFill(this.confirmPasswordInput, confirmPassword);
    }

    async save() {
        await this.click(this.saveButton);
        // Give the save request and its redirect back to System Users time
        // to settle before the caller navigates or re-searches.
        await this.page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => undefined);
    }

    async addUser(params: {
        role: string;
        employeeName: string;
        status: string;
        username: string;
        password: string;
        confirmPassword?: string;
    }) {
        await this.selectUserRole(params.role);
        await this.selectEmployee(params.employeeName);
        await this.selectStatus(params.status);
        await this.fillCredentials(params.username, params.password, params.confirmPassword);
        await this.save();
    }

    /* ---------------------------
       Assertions
    ---------------------------- */

    async verifyRequiredFieldError() {
        await this.expectVisible(this.requiredFieldError, 'Required field validation should be visible');
    }

    async verifyPasswordMismatchError() {
        await this.expectVisible(this.passwordMismatchError, 'Password mismatch validation should be visible');
    }
}
