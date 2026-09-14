import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { URLS } from '../../../config/urls';

/**
 * My Info (ESS) — Personal Details self-service screen.
 *
 * This suite is intentionally read-only: My Info edits the logged-in
 * employee's real record on the shared OrangeHRM demo, so tests here only
 * navigate and assert visibility rather than saving changes.
 */
export class MyInfoPage extends BasePage {
    private readonly employeeFullNameHeading: Locator;
    private readonly employeeIdField: Locator;

    constructor(page: Page) {
        super(page);

        this.employeeFullNameHeading = page.locator('.orangehrm-edit-employee-name');
        this.employeeIdField = page
            .locator('.oxd-input-group')
            .filter({ hasText: 'Employee Id' })
            .locator('input');
    }

    private tab(name: string): Locator {
        return this.page.getByRole('tab', { name }).or(this.page.getByText(name, { exact: true }));
    }

    /* ---------------------------
       Actions
    ---------------------------- */

    async open() {
        await this.goto(URLS.MY_INFO);
    }

    async openTab(name: string) {
        await this.click(this.tab(name));
    }

    /* ---------------------------
       Assertions
    ---------------------------- */

    async verifyPersonalDetailsLoaded() {
        await this.expectVisible(this.employeeFullNameHeading, 'Employee name header should be visible on My Info');
        await this.expectVisible(this.employeeIdField, 'Employee Id field should be visible on Personal Details');
    }

    async verifyTabLoaded(name: string) {
        await this.expectVisible(
            this.page.getByText(name, { exact: true }).first(),
            `${name} tab content should be visible`
        );
    }
}
