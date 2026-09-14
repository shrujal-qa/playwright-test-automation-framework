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
     * Two prior strategies both failed identically (value never changes):
     * a `.oxd-autocomplete-dropdown` class match found nothing at all, and
     * a page-wide `role="option"` query found *something* but clicking it
     * never affected the field — most likely a native, visually-hidden
     * `<select><option>` elsewhere on the page that satisfies the ARIA
     * role query without being the real suggestion widget at all.
     *
     * This scopes to the widget's own wrapper (walking up from the input
     * to its nearest `.oxd-autocomplete*` ancestor) and searches by text
     * inside just that container — avoiding both prior false leads — and
     * logs the wrapper's actual DOM text on the first attempt so a
     * continued failure is diagnosable rather than another blind guess.
     */
    async selectEmployee(employeeName: string, maxAttempts = 3): Promise<void> {
        const widget = this.employeeNameInput.locator(
            'xpath=ancestor::*[contains(@class, "oxd-autocomplete")][1]'
        );

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            await this.stableFill(this.employeeNameInput, employeeName);
            const suggestion = widget.getByText(employeeName, { exact: false }).first();
            const suggestionAppeared = await suggestion
                .waitFor({ state: 'visible', timeout: 3_000 * attempt })
                .then(() => true)
                .catch(() => false);

            if (suggestionAppeared) {
                await suggestion.click();
            } else {
                await this.employeeNameInput.press('ArrowDown');
                await this.employeeNameInput.press('Enter');
            }

            const value = await this.employeeNameInput.inputValue().catch(() => '');
            const widgetText = await widget
                .innerText()
                .then((text) => text.replace(/\s+/g, ' ').trim().slice(0, 300))
                .catch(() => '(could not read widget)');
            Logger.info(
                `AddUserPage.selectEmployee(): attempt=${attempt} suggestionAppeared=${suggestionAppeared} ` +
                    `valueAfterSelection="${value}" widgetText="${widgetText}"`
            );

            if (suggestionAppeared) return;

            if (attempt === maxAttempts) {
                throw new Error(
                    `Could not find a widget-scoped employee suggestion for "${employeeName}" after ${maxAttempts} ` +
                        `attempts (last widget text: "${widgetText}")`
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
        // with no Required error visible either — dump a broader snapshot
        // of the page so a continued failure is finally diagnosable.
        const contexts = await this.describeRequiredFieldErrors();
        const bodyText = await this.page
            .locator('body')
            .innerText()
            .then((text) => text.replace(/\s+/g, ' ').trim().slice(0, 1_000))
            .catch(() => '(could not read body)');
        Logger.info(
            `AddUserPage.save(): url=${this.page.url()} requiredErrors=${JSON.stringify(contexts)} bodyText="${bodyText}"`
        );
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
