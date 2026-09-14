import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { URLS } from '../../../config/urls';

export class LeaveListPage extends BasePage {
    private readonly statusDropdown: Locator;
    private readonly searchButton: Locator;
    private readonly pageHeading: Locator;

    constructor(page: Page) {
        super(page);

        this.statusDropdown = page
            .locator('.oxd-input-group')
            .filter({ hasText: 'Leave Status' })
            .locator('.oxd-select-text');
        this.searchButton = page.getByRole('button', { name: /search/i });
        this.pageHeading = page.getByText('Leave List', { exact: true });
    }

    /* ---------------------------
       Actions
    ---------------------------- */

    async open() {
        await this.goto(URLS.LEAVE_LIST);
    }

    async filterByStatus(status: string) {
        await this.selectDropdownOption(this.statusDropdown, status);
        await this.click(this.searchButton);
    }

    async search() {
        await this.click(this.searchButton);
    }

    /* ---------------------------
       Assertions
    ---------------------------- */

    async verifyListLoaded() {
        await this.expectVisible(this.pageHeading, 'Leave List page should be visible to Admin');
    }
}
