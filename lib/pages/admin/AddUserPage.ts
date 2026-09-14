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
     * The prior keyboard-only approach (ArrowDown + Enter with no visible
     * suggestion check) "succeeded" on every attempt because the field's
     * value is already non-empty from the typed search text — that check
     * couldn't tell a real selection apart from Enter doing nothing. This
     * now waits for an ARIA `option` (a different, standards-based
     * strategy from the `.oxd-autocomplete-dropdown` class match that
     * never worked here) and clicks it directly; if none ever appears, it
     * logs that fact explicitly instead of silently treating leftover
     * typed text as a successful selection.
     */
    async selectEmployee(employeeName: string, maxAttempts = 3): Promise<void> {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            await this.stableFill(this.employeeNameInput, employeeName);
            const option = this.page.getByRole('option').first();
            const optionAppeared = await option
                .waitFor({ state: 'visible', timeout: 3_000 * attempt })
                .then(() => true)
                .catch(() => false);

            if (optionAppeared) {
                await option.click();
            } else {
                await this.employeeNameInput.press('ArrowDown');
                await this.employeeNameInput.press('Enter');
            }

            const value = await this.employeeNameInput.inputValue().catch(() => '');
            Logger.info(
                `AddUserPage.selectEmployee(): attempt=${attempt} optionRoleAppeared=${optionAppeared} valueAfterSelection="${value}"`
            );

            // A real selection replaces the typed search text with the
            // matched employee's full name (longer than what we typed).
            // The typed text unchanged means nothing was actually selected.
            if (optionAppeared || value.trim().length > employeeName.length) return;

            if (attempt === maxAttempts) {
                throw new Error(
                    `Could not select a real employee suggestion for "${employeeName}" after ${maxAttempts} attempts ` +
                        `(field value stayed "${value}")`
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
        // without an obvious cause — the employee picker itself now
        // verifies it populated a value, so the blocker is something else.
        const contexts = await this.describeRequiredFieldErrors();
        if (contexts.length > 0) {
            Logger.info(
                `AddUserPage.save(): still on ${this.page.url()} — Required error(s): ${JSON.stringify(contexts)}`
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
