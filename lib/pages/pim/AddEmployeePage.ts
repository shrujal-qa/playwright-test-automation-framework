import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { URLS } from '../../../config/urls';
import { MESSAGES } from '../../data/constants/messages';

export type NewEmployeeData = {
    firstName: string;
    middleName?: string;
    lastName: string;
    employeeId?: string;
};

export class AddEmployeePage extends BasePage {
    private readonly saveButton: Locator;
    private readonly cancelButton: Locator;
    private readonly createLoginDetailsToggle: Locator;
    private readonly requiredFieldError: Locator;

    constructor(page: Page) {
        super(page);

        this.saveButton = page.getByRole('button', { name: 'Save' });
        this.cancelButton = page.getByRole('button', { name: 'Cancel' });
        this.createLoginDetailsToggle = page.locator('.oxd-switch-input');
        this.requiredFieldError = page.getByText('Required').first();
    }

    /* ---------------------------
       Navigation
    ---------------------------- */

    async open() {
        await this.goto(URLS.PIM_ADD_EMPLOYEE);
        await this.expectVisible(this.saveButton);
    }

    /* ---------------------------
       Actions
    ---------------------------- */

    async fillBasicInfo(data: NewEmployeeData) {
        await this.stableFill(this.inputByName('firstName'), data.firstName);
        if (data.middleName !== undefined) {
            await this.stableFill(this.inputByName('middleName'), data.middleName);
        }
        await this.stableFill(this.inputByName('lastName'), data.lastName);
        if (data.employeeId !== undefined) {
            await this.stableFill(this.inputByLabel('Employee Id'), data.employeeId);
        }
    }

    async fillName(firstName: string, lastName: string, middleName = '') {
        await this.fillBasicInfo({ firstName, lastName, middleName: middleName || undefined });
    }

    async toggleCreateLoginDetails() {
        await this.click(this.createLoginDetailsToggle);
    }

    async save() {
        await this.click(this.saveButton);
        // Give the save request and its redirect to Personal Details time
        // to settle before the caller asserts on the destination page.
        await this.page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => undefined);
    }

    async cancel() {
        await this.click(this.cancelButton);
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
        const employeeIdInput = this.inputByLabel('Employee Id');
        await employeeIdInput.click();
        await employeeIdInput.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A');
        await employeeIdInput.press('Delete');
        await this.click(this.saveButton);
        await this.page.waitForURL(/\/pim\/viewPersonalDetails\//, { timeout: 20_000 }).catch(async () => {
            const errors = await this.page.locator('.oxd-input-field-error-message').allInnerTexts();
            throw new Error(
                `Employee "${firstName} ${lastName}" was not saved (still on ${this.page.url()}); ` +
                    `form errors: ${JSON.stringify(errors)}`
            );
        });
    }

    /**
     * Creates an employee and waits for the redirect to that employee's
     * Personal Details page (`/pim/viewPersonalDetails/empNumber/<n>`),
     * which OrangeHRM performs automatically on a successful save.
     *
     * Returns the (custom or auto-generated) Employee Id, since it is the
     * only reliable handle for looking the record back up later — the
     * Employee Name autocomplete index can lag behind a just-made edit.
     */
    async createEmployee(data: NewEmployeeData): Promise<{ employeeId: string }> {
        await this.fillBasicInfo(data);
        const employeeId = await this.getGeneratedEmployeeId();
        await this.click(this.saveButton);
        await this.expectToast(MESSAGES.SUCCESSFULLY_SAVED);
        await this.page.waitForURL(/viewPersonalDetails/, { timeout: 15_000 });
        return { employeeId };
    }

    /* ---------------------------
       Assertions
    ---------------------------- */

    async verifyRequiredFieldError() {
        await this.expectVisible(this.requiredFieldError, 'Required field validation message should be visible');
    }

    async expectFirstNameRequired() {
        await expect(this.fieldErrorByName('firstName')).toHaveText(MESSAGES.REQUIRED);
    }

    async expectLastNameRequired() {
        await expect(this.fieldErrorByName('lastName')).toHaveText(MESSAGES.REQUIRED);
    }

    async expectEmployeeIdAlreadyExists() {
        await expect(this.fieldErrorByLabel('Employee Id')).toHaveText(MESSAGES.EMPLOYEE_ID_ALREADY_EXISTS);
    }

    async getGeneratedEmployeeId(): Promise<string> {
        return this.inputByLabel('Employee Id').inputValue();
    }
}
