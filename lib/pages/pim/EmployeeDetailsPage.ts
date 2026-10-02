import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { MESSAGES } from '../../data/constants/messages';

/**
 * Represents the "Personal Details" tab of an employee's profile
 * (`/pim/viewPersonalDetails/empNumber/<n>`), the view PIM lands on
 * immediately after `AddEmployeePage.createEmployee()` and that "My Info"
 * reuses for the logged-in user's own record.
 *
 * Only the fields this framework currently exercises are modeled here.
 * Other tabs (Contact Details, Emergency Contacts, Job, Salary, …) are
 * intentionally out of scope until a scenario needs them — see
 * docs/test-coverage.md roadmap.
 */
export class EmployeeDetailsPage extends BasePage {
    private readonly saveButton: Locator;

    constructor(page: Page) {
        super(page);
        this.saveButton = page.getByRole('button', { name: 'Save' }).first();
    }

    /** Navigates directly to an employee's Personal Details tab by employee number (reliable — unlike name search, unaffected by autocomplete index lag right after an edit). */
    async openByEmployeeNumber(empNumber: string) {
        await this.goto(`/web/index.php/pim/viewPersonalDetails/empNumber/${empNumber}`);
        await this.expectVisible(this.inputByName('lastName'));
    }

    async updateName(data: { firstName?: string; middleName?: string; lastName?: string }) {
        if (data.firstName !== undefined) {
            await this.stableFill(this.inputByName('firstName'), data.firstName);
        }
        if (data.middleName !== undefined) {
            await this.stableFill(this.inputByName('middleName'), data.middleName);
        }
        if (data.lastName !== undefined) {
            await this.stableFill(this.inputByName('lastName'), data.lastName);
        }
        await this.click(this.saveButton);
        await this.expectToast(MESSAGES.SUCCESSFULLY_UPDATED);
    }

    async getFullName(): Promise<{ firstName: string; middleName: string; lastName: string }> {
        return {
            firstName: await this.inputByName('firstName').inputValue(),
            middleName: await this.inputByName('middleName').inputValue(),
            lastName: await this.inputByName('lastName').inputValue(),
        };
    }

    getEmployeeNumberFromUrl(): string {
        const match = this.page.url().match(/empNumber\/(\d+)/);
        if (!match) {
            throw new Error(`Not on an employee details URL: ${this.page.url()}`);
        }
        return match[1];
    }
}
