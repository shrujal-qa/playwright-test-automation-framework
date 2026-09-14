import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { URLS } from '../../../config/urls';
import { MESSAGES } from '../../data/constants/messages';

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
