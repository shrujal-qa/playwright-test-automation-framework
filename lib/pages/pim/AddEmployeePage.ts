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

    constructor(page: Page) {
        super(page);

        this.saveButton = page.getByRole('button', { name: 'Save' });
        this.cancelButton = page.getByRole('button', { name: 'Cancel' });
        this.createLoginDetailsToggle = page.locator('.oxd-switch-input');
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

    async toggleCreateLoginDetails() {
        await this.click(this.createLoginDetailsToggle);
    }

    async save() {
        await this.click(this.saveButton);
    }

    async cancel() {
        await this.click(this.cancelButton);
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
        await this.save();
        await this.expectToast(MESSAGES.SUCCESSFULLY_SAVED);
        await this.page.waitForURL(/viewPersonalDetails/, { timeout: 15_000 });
        return { employeeId };
    }

    /* ---------------------------
       Assertions
    ---------------------------- */

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
