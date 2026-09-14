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
     * The widget-scoped wrapper (`.oxd-autocomplete*` ancestor) genuinely
     * exists but its innerText is always empty — meaning the suggestion
     * list itself is not nested inside it in the DOM. This is consistent
     * with the dropdown being rendered as a portal/teleport elsewhere in
     * the document (a common pattern to escape parent overflow clipping),
     * which every DOM-proximity-based strategy so far has missed.
     *
     * The employee's search text is generated to be globally unique, so a
     * plain page-wide text search is actually safe here and sidesteps the
     * whole "where does the dropdown render" question — it'll find the
     * suggestion wherever it lives. `getByText` only matches real text
     * nodes, not form control values, so it won't match the input itself.
     */
    async selectEmployee(employeeName: string, maxAttempts = 3): Promise<void> {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            await this.stableFill(this.employeeNameInput, employeeName);
            const suggestion = this.page.getByText(employeeName, { exact: false }).first();
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
            Logger.info(
                `AddUserPage.selectEmployee(): attempt=${attempt} suggestionAppeared=${suggestionAppeared} valueAfterSelection="${value}"`
            );

            if (suggestionAppeared) return;

            if (attempt === maxAttempts) {
                const bodyText = await this.page
                    .locator('body')
                    .innerText()
                    .then((text) => text.replace(/\s+/g, ' ').trim().slice(0, 1_000))
                    .catch(() => '(could not read body)');
                Logger.info(`AddUserPage.selectEmployee(): final bodyText="${bodyText}"`);
                throw new Error(
                    `Could not find any page text matching "${employeeName}" after ${maxAttempts} attempts`
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
