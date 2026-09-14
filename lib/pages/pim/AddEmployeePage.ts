import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { URLS } from '../../../config/urls';

export class AddEmployeePage extends BasePage {
    private readonly firstNameInput: Locator;
    private readonly middleNameInput: Locator;
    private readonly lastNameInput: Locator;
    private readonly saveButton: Locator;
    private readonly requiredFieldError: Locator;

    constructor(page: Page) {
        super(page);

        this.firstNameInput = page.locator('input[name="firstName"]');
        this.middleNameInput = page.locator('input[name="middleName"]');
        this.lastNameInput = page.locator('input[name="lastName"]');
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
    }

    async addEmployee(firstName: string, lastName: string, middleName = '') {
        await this.fillName(firstName, lastName, middleName);
        await this.save();
    }

    /* ---------------------------
       Assertions
    ---------------------------- */

    async verifyRequiredFieldError() {
        await this.expectVisible(this.requiredFieldError, 'Required field validation message should be visible');
    }
}
