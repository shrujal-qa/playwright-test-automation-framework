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
            .filter({ hasText: 'Show Leave with Status' })
            .locator('.oxd-select-text');
        this.searchButton = page.getByRole('button', { name: /search/i });
        this.pageHeading = page.getByRole('heading', { name: 'Leave List' });
    }

    /* ---------------------------
       Actions
    ---------------------------- */

    async open() {
        await this.goto(URLS.LEAVE_LIST);
        await this.waitForFormLoader();
    }

    /**
     * The status filter is a multi-select that renders chosen values as
     * chips and drops them from its option list, and "Pending Approval" is
     * pre-selected by default — so only pick the option when it isn't
     * already a chip.
     */
    async filterByStatus(status: string) {
        const alreadySelected = await this.page.locator('.oxd-chip', { hasText: status }).count();
        if (!alreadySelected) {
            await this.selectDropdownOption(this.statusDropdown, status);
        }
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
