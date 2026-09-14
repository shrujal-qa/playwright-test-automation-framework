import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { URLS } from '../../../config/urls';
import { MESSAGES } from '../../data/constants/messages';
import { Logger } from '../../utils/Logger';

export class AddCandidatePage extends BasePage {
    private readonly firstNameInput: Locator;
    private readonly lastNameInput: Locator;
    private readonly emailInput: Locator;
    private readonly saveButton: Locator;
    private readonly requiredFieldError: Locator;
    private readonly invalidEmailError: Locator;

    constructor(page: Page) {
        super(page);

        this.firstNameInput = page.locator('input[name="firstName"]');
        this.lastNameInput = page.locator('input[name="lastName"]');
        this.emailInput = page
            .locator('.oxd-input-group')
            .filter({ hasText: 'Email' })
            .locator('input');
        this.saveButton = page.getByRole('button', { name: /save/i });
        this.requiredFieldError = page.getByText('Required').first();
        this.invalidEmailError = page.getByText(MESSAGES.INVALID_EMAIL);
    }

    /* ---------------------------
       Actions
    ---------------------------- */

    async open() {
        await this.goto(URLS.RECRUITMENT_ADD_CANDIDATE);
    }

    async fillCandidateDetails(firstName: string, lastName: string, email: string) {
        await this.stableFill(this.firstNameInput, firstName);
        await this.stableFill(this.lastNameInput, lastName);
        await this.stableFill(this.emailInput, email);
    }

    async save() {
        await this.click(this.saveButton);
        // Give the save request (and any resulting redirect) time to settle
        // before the caller navigates away — a toast is too transient to
        // rely on as that signal.
        await this.page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => undefined);

        // Confirmed in CI that save silently fails validation (stays on
        // addCandidate with a Required error) but not *which* field —
        // the previous ancestor-based lookup itself failed to resolve.
        const contexts = await this.describeRequiredFieldErrors();
        if (contexts.length > 0) {
            Logger.info(
                `AddCandidatePage.save(): still on ${this.page.url()} — Required error(s): ${JSON.stringify(contexts)}`
            );
        }
    }

    async addCandidate(firstName: string, lastName: string, email: string) {
        await this.fillCandidateDetails(firstName, lastName, email);
        await this.save();
    }

    /* ---------------------------
       Assertions
    ---------------------------- */

    async verifyRequiredFieldError() {
        await this.expectVisible(this.requiredFieldError, 'Required field validation should be visible');
    }

    async verifyInvalidEmailError() {
        await this.expectVisible(this.invalidEmailError, 'Invalid email validation should be visible');
    }
}
