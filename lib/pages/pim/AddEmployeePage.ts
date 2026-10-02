import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { URLS } from '../../../config/urls';

export class AddEmployeePage extends BasePage {
    private readonly firstNameInput: Locator;
    private readonly middleNameInput: Locator;
    private readonly lastNameInput: Locator;
    private readonly employeeIdInput: Locator;
    private readonly saveButton: Locator;
    private readonly requiredFieldError: Locator;

    constructor(page: Page) {
        super(page);

        this.firstNameInput = page.locator('input[name="firstName"]');
        this.middleNameInput = page.locator('input[name="middleName"]');
        this.lastNameInput = page.locator('input[name="lastName"]');
        this.employeeIdInput = page
            .locator('.oxd-input-group')
            .filter({ hasText: 'Employee Id' })
            .locator('input');
        this.saveButton = page.getByRole('button', { name: /save/i });
        this.requiredFieldError = page.getByText('Required').first();
    }

    /* ---------------------------
       Actions
    ---------------------------- */

    async open() {
        await this.goto(URLS.PIM_ADD_EMPLOYEE);
    }

    async fillName(firstName: string, lastName: string, middleName = '') {
        await this.stableFill(this.firstNameInput, firstName);
        if (middleName) {
            await this.stableFill(this.middleNameInput, middleName);
        }
        await this.stableFill(this.lastNameInput, lastName);
    }

    async save() {
        await this.click(this.saveButton);
        // Give the save request and its redirect to Personal Details time
        // to settle before the caller asserts on the destination page.
        await this.page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => undefined);
    }

    async addEmployee(firstName: string, lastName: string, middleName = '') {
        await this.fillName(firstName, lastName, middleName);
        await this.save();
    }

    /**
     * Creates an employee and fails loudly unless the save really landed.
     *
     * The form pre-fills the next sequential Employee Id, so two runs (or
     * two parallel workers) opening Add Employee at the same time get the
     * same Id and one save is silently rejected as a duplicate. Employee Id
     * is optional, so it is cleared, and the redirect to Personal Details
     * is awaited as proof the employee exists before callers rely on it.
     */
    async addEmployeeAndConfirm(firstName: string, lastName: string) {
        await this.fillName(firstName, lastName);
        await this.employeeIdInput.click();
        await this.employeeIdInput.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A');
        await this.employeeIdInput.press('Delete');
        await this.click(this.saveButton);
        await this.page.waitForURL(/\/pim\/viewPersonalDetails\//, { timeout: 20_000 }).catch(async () => {
            const errors = await this.page.locator('.oxd-input-field-error-message').allInnerTexts();
            throw new Error(
                `Employee "${firstName} ${lastName}" was not saved (still on ${this.page.url()}); ` +
                    `form errors: ${JSON.stringify(errors)}`
            );
        });
    }

    /* ---------------------------
       Assertions
    ---------------------------- */

    async verifyRequiredFieldError() {
        await this.expectVisible(this.requiredFieldError, 'Required field validation message should be visible');
    }
}
