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
 *
 * The checkpoint did not reliably appear when deep-linking straight to a
 * Maintenance URL (two different guessed URLs both failed against the live
 * demo), which points to it being gated behind the in-app navigation click
 * rather than being its own freely-linkable route — so this opens the
 * module the way a real user would, via the sidebar link.
 */
export class MaintenancePage extends BasePage {
    private readonly maintenanceNavLink: Locator;
    private readonly passwordInput: Locator;
    private readonly errorAlert: Locator;
    private readonly purgeEmployeeRecordsOption: Locator;

    constructor(page: Page) {
        super(page);

        this.maintenanceNavLink = page.getByRole('link', { name: 'Maintenance', exact: true });
        this.passwordInput = page.getByRole('textbox', { name: /password/i }).or(page.locator('input[type="password"]'));
        this.errorAlert = page.getByRole('alert');
        this.purgeEmployeeRecordsOption = page.getByText('Purge Employee Records', { exact: true });
    }

    /* ---------------------------
       Actions
    ---------------------------- */

    async open() {
        await this.goto(URLS.DASHBOARD);
        await this.click(this.maintenanceNavLink);
    }

    async submitCheckpointPassword(password: string) {
        await this.stableFill(this.passwordInput, password);
        // Submitting via Enter sidesteps needing to know the exact button
        // label/markup, which has varied between attempts against the
        // live demo.
        await this.passwordInput.press('Enter');
        await this.page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => undefined);
    }

    /* ---------------------------
       Assertions
    ---------------------------- */

    async verifyCheckpointDisplayed() {
        await this.expectVisible(this.passwordInput, 'Maintenance security checkpoint should prompt for a password');
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
