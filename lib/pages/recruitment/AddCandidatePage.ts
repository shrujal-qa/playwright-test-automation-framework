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

        // The candidate has failed to show up in search afterward with no
        // Required error either — a full run's retries exhausted without
        // finding it. Dump a broader page snapshot so this is finally
        // diagnosable instead of another guess.
        const contexts = await this.describeRequiredFieldErrors();
        const bodyText = await this.page
            .locator('body')
            .innerText()
            .then((text) => text.replace(/\s+/g, ' ').trim().slice(0, 1_000))
            .catch(() => '(could not read body)');
        Logger.info(
            `AddCandidatePage.save(): url=${this.page.url()} requiredErrors=${JSON.stringify(contexts)} bodyText="${bodyText}"`
        );
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
