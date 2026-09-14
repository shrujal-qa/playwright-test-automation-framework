import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { URLS } from '../../../config/urls';

/**
 * Maintenance module security checkpoint.
 *
 * Maintenance re-prompts for the current password before granting access,
 * and its only actions from there are destructive data purges. This page
 * object intentionally stops at the checkpoint — no purge action is ever
 * triggered by the test suite.
 */
export class MaintenancePage extends BasePage {
    private readonly passwordInput: Locator;
    private readonly continueButton: Locator;
    private readonly errorAlert: Locator;
    private readonly purgeEmployeeRecordsOption: Locator;

    constructor(page: Page) {
        super(page);

        this.passwordInput = page.getByRole('textbox', { name: /password/i }).or(page.locator('input[type="password"]'));
        this.continueButton = page
            .getByRole('button', { name: /continue|submit|proceed/i })
            .or(page.locator('button[type="submit"]'));
        this.errorAlert = page.getByRole('alert');
        this.purgeEmployeeRecordsOption = page.getByText('Purge Employee Records', { exact: true });
    }

    /* ---------------------------
       Actions
    ---------------------------- */

    async open() {
        await this.goto(URLS.MAINTENANCE_VALIDATE);
    }

    async submitCheckpointPassword(password: string) {
        await this.stableFill(this.passwordInput, password);
        await this.click(this.continueButton);
    }

    /* ---------------------------
       Assertions
    ---------------------------- */

    async verifyCheckpointDisplayed() {
        await this.expectVisible(this.continueButton, 'Maintenance security checkpoint should prompt for a password');
    }

    async verifyCheckpointRejected() {
        await this.expectVisible(this.errorAlert, 'An invalid checkpoint password should show an error');
    }

    async verifyPurgeOptionsVisible() {
        await this.expectVisible(
            this.purgeEmployeeRecordsOption,
            'Purge Employee Records option should be visible after passing the checkpoint'
        );
    }
}
