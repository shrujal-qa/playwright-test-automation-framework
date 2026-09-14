import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { MESSAGES } from '../../data/constants/messages';
import { Logger } from '../../utils/Logger';

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

    /**
     * This widget's suggestion list never matched the `.oxd-autocomplete-
     * dropdown` container that works for every other autocomplete field in
     * the app (confirmed by repeated CI failures, not a timing issue —
     * retrying the same wait did not help). Selecting via keyboard instead
     * (arrow down to the first match, then Enter) works with any dropdown
     * markup, since it doesn't need to locate the suggestion element at all.
     *
     * A successful selection replaces the field's value with the matched
     * employee's full name, so an unchanged/empty value afterward means
     * the debounced search hadn't produced a suggestion yet — retried with
     * a longer wait rather than assumed to have worked.
     */
    async selectEmployee(employeeName: string, maxAttempts = 3): Promise<void> {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            await this.stableFill(this.employeeNameInput, employeeName);
            await this.page.waitForTimeout(1_000 * attempt); // let the debounced suggestion search resolve
            await this.employeeNameInput.press('ArrowDown');
            await this.employeeNameInput.press('Enter');

            const value = await this.employeeNameInput.inputValue().catch(() => '');
            if (value.trim().length > 0) return;
            if (attempt === maxAttempts) {
                throw new Error(
                    `Employee Name field is still empty after ${maxAttempts} attempts to select "${employeeName}"`
                );
            }
        }
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

        // ADM-002 has failed downstream (created user not found by search)
        // without an obvious cause. Log every visible "Required" error's
        // containing field group so a future run's log pinpoints whether
        // the employee picker (or anything else) silently stayed empty.
        const requiredErrors = this.page.getByText('Required');
        const count = await requiredErrors.count().catch(() => 0);
        if (count > 0) {
            const contexts: string[] = [];
            for (let i = 0; i < count; i++) {
                const context = await requiredErrors
                    .nth(i)
                    .locator('xpath=ancestor::*[contains(@class, "oxd-input-group")][1]')
                    .innerText()
                    .then((text) => text.replace(/\s+/g, ' ').trim())
                    .catch(() => '(could not read containing field)');
                contexts.push(context);
            }
            Logger.info(
                `AddUserPage.save(): still on ${this.page.url()} — ${count} Required error(s): ${JSON.stringify(contexts)}`
            );
        }
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
