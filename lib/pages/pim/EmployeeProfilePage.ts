import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage';

/**
 * Represents the Employee "Personal Details" screen reached after adding
 * an employee, or via PIM > Employee List > (click a row).
 */
export class EmployeeProfilePage extends BasePage {
    private readonly employeeFullNameHeading: Locator;
    private readonly nationalityDropdown: Locator;
    private readonly saveButton: Locator;

    constructor(page: Page) {
        super(page);

        this.employeeFullNameHeading = page.locator('.orangehrm-edit-employee-name');
        this.nationalityDropdown = page
            .locator('.oxd-input-group')
            .filter({ hasText: 'Nationality' })
            .locator('.oxd-select-text');
        this.saveButton = page.getByRole('button', { name: /save/i }).first();
    }

    /* ---------------------------
       Actions
    ---------------------------- */

    async setNationality(nationality: string) {
        await this.selectDropdownOption(this.nationalityDropdown, nationality);
    }

    async save() {
        await this.click(this.saveButton);
        // Give the save request time to settle before the caller reloads
        // or navigates away — a toast is too transient to rely on.
        await this.page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => undefined);
    }

    /* ---------------------------
       Assertions
    ---------------------------- */

    async verifyProfileHeaderContains(fullName: string) {
        await this.expectVisible(this.employeeFullNameHeading);
        await this.expectText(this.employeeFullNameHeading, fullName);
    }

    /**
     * Reloads the page and re-reads the Nationality field from a clean
     * load — proof the update actually persisted server-side, rather than
     * trusting a save-confirmation toast that can disappear before the
     * assertion polls for it.
     */
    async verifyNationalityIs(nationality: string) {
        await this.page.reload({ waitUntil: 'domcontentloaded' });
        await this.expectText(this.nationalityDropdown, nationality);
    }
}
