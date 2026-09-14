import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { URLS } from '../../../config/urls';
import { MESSAGES } from '../../data/constants/messages';
import { Logger } from '../../utils/Logger';

export class CandidatesPage extends BasePage {
    private readonly addButton: Locator;
    private readonly candidateNameInput: Locator;
    private readonly searchButton: Locator;
    private readonly tableRows: Locator;
    private readonly noRecordsText: Locator;
    private readonly confirmDeleteButton: Locator;

    constructor(page: Page) {
        super(page);

        this.addButton = page.getByRole('button', { name: /add/i });
        this.candidateNameInput = page
            .locator('.oxd-input-group')
            .filter({ hasText: 'Candidate Name' })
            .locator('input');
        this.searchButton = page.getByRole('button', { name: /search/i });
        this.tableRows = page.locator('.oxd-table-card');
        this.noRecordsText = page.getByText(MESSAGES.NO_RECORDS_FOUND);
        this.confirmDeleteButton = page.getByRole('button', { name: /yes, delete/i });
    }

    /* ---------------------------
       Actions
    ---------------------------- */

    async open() {
        await this.goto(URLS.RECRUITMENT);
    }

    async clickAddCandidate() {
        await this.click(this.addButton);
    }

    async searchByCandidateName(name: string) {
        await this.stableFill(this.candidateNameInput, name);
        await this.click(this.searchButton);
    }

    /**
     * Retries the search a few times before giving up. A just-created
     * candidate has occasionally taken a moment to become searchable on
     * the shared demo instance, so a single immediate search is not a
     * reliable enough signal that creation actually failed.
     */
    async searchUntilFound(name: string, maxAttempts = 5, retryDelayMs = 3_000): Promise<void> {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            await this.searchByCandidateName(name);
            const found = await this.tableRows
                .filter({ hasText: name })
                .first()
                .waitFor({ state: 'visible', timeout: 5_000 })
                .then(() => true)
                .catch(() => false);
            if (found) return;
            if (attempt < maxAttempts) {
                await this.page.waitForTimeout(retryDelayMs);
                await this.open();
            }
        }

        // Exhausted every retry with no clear cause from prior rounds —
        // log whether the list is genuinely empty (No Records Found) or
        // showing something else entirely, and how many rows exist at all.
        const noRecords = await this.noRecordsText.isVisible().catch(() => false);
        const rowCount = await this.tableRows.count().catch(() => -1);
        const bodyText = await this.page
            .locator('body')
            .innerText()
            .then((text) => text.replace(/\s+/g, ' ').trim().slice(0, 1_000))
            .catch(() => '(could not read body)');
        Logger.info(
            `CandidatesPage.searchUntilFound(): gave up on "${name}" — noRecordsFound=${noRecords} rowCount=${rowCount} bodyText="${bodyText}"`
        );
        throw new Error(`Candidate "${name}" did not appear in the list after ${maxAttempts} search attempts`);
    }

    async deleteCandidateByName(fullName: string) {
        const row = this.tableRows.filter({ hasText: fullName }).first();
        await row.locator('.bi-trash, [class*="trash"]').click();
        await this.click(this.confirmDeleteButton);
    }

    /* ---------------------------
       Assertions
    ---------------------------- */

    async verifyListLoaded() {
        await this.expectVisible(this.page.getByText('Candidates', { exact: true }).first());
    }

    async verifyRowVisible(fullName: string) {
        await this.expectVisible(
            this.tableRows.filter({ hasText: fullName }).first(),
            `Candidate row for ${fullName} should be visible`
        );
    }

    async verifyNoRecordsFound() {
        await this.expectVisible(this.noRecordsText, 'No Records Found should be shown for an unmatched search');
    }
}
