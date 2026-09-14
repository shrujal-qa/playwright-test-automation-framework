import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { MESSAGES } from '../../data/constants/messages';

/**
 * Represents the Employee "Personal Details" screen reached after adding
 * an employee, or via PIM > Employee List > (click a row).
 */
export class EmployeeProfilePage extends BasePage {
    private readonly employeeFullNameHeading: Locator;
    private readonly nationalityDropdown: Locator;
    private readonly saveButton: Locator;
    private readonly successToast: Locator;

    constructor(page: Page) {
        super(page);

        this.employeeFullNameHeading = page.locator('.orangehrm-edit-employee-name');
        this.nationalityDropdown = page
            .locator('.oxd-input-group')
            .filter({ hasText: 'Nationality' })
            .locator('.oxd-select-text');
        this.saveButton = page.getByRole('button', { name: /save/i }).first();
        this.successToast = page.getByText(MESSAGES.SUCCESSFULLY_UPDATED);
    }

    /* ---------------------------
       Actions
    ---------------------------- */

    async setNationality(nationality: string) {
        await this.selectDropdownOption(this.nationalityDropdown, nationality);
    }

    async save() {
        await this.click(this.saveButton);
    }

    /* ---------------------------
       Assertions
    ---------------------------- */

    async verifyProfileHeaderContains(fullName: string) {
        await this.expectVisible(this.employeeFullNameHeading);
        await this.expectText(this.employeeFullNameHeading, fullName);
    }

    async verifyUpdateSaved() {
        await this.expectVisible(this.successToast, 'Successfully Updated toast should appear after saving');
    }
}
