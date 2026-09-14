import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { URLS } from '../../../config/urls';

export class DirectoryPage extends BasePage {
    private readonly jobTitleDropdown: Locator;
    private readonly searchButton: Locator;
    private readonly resetButton: Locator;
    private readonly employeeCards: Locator;

    constructor(page: Page) {
        super(page);

        this.jobTitleDropdown = page
            .locator('.oxd-input-group')
            .filter({ hasText: 'Job Title' })
            .locator('.oxd-select-text');
        this.searchButton = page.getByRole('button', { name: /search/i });
        this.resetButton = page.getByRole('button', { name: /reset/i });
        this.employeeCards = page.locator('.orangehrm-directory-card');
    }

    /* ---------------------------
       Actions
    ---------------------------- */

    async open() {
        await this.goto(URLS.DIRECTORY);
    }

    /**
     * Filters by whichever Job Title happens to be first in the dropdown —
     * avoids depending on a hard-coded title that may not exist in every
     * environment.
     */
    async filterByFirstAvailableJobTitle(): Promise<string> {
        await this.click(this.jobTitleDropdown);
        const firstOption = this.page
            .locator('.oxd-select-dropdown [role="option"], .oxd-select-dropdown > div')
            .first();
        await firstOption.waitFor({ state: 'visible' });
        const text = (await firstOption.textContent())?.trim() ?? '';
        await firstOption.click();
        await this.click(this.searchButton);
        return text;
    }

    async resetFilters() {
        await this.click(this.resetButton);
    }

    /* ---------------------------
       Assertions
    ---------------------------- */

    async verifyDirectoryLoaded() {
        await this.expectVisible(this.page.getByText('Directory', { exact: true }).first());
    }

    async verifyAtLeastOneResult() {
        await this.expectVisible(this.employeeCards.first(), 'At least one directory card should be visible');
    }
}
