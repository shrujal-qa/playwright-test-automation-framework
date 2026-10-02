import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { URLS } from '../../../config/urls';

/**
 * "Assign Leave" (Admin assigns leave to an employee on their behalf).
 *
 * Scope note: only navigation is modeled so far. The form's field set and
 * submit-button label were not verified via live inspection (see
 * docs/test-coverage.md roadmap) — extend this page object once that's
 * confirmed, following the same pattern as `ApplyLeavePage`.
 */
export class AssignLeavePage extends BasePage {
    private readonly pageHeading: Locator;

    constructor(page: Page) {
        super(page);
        // "Assign Leave" also appears as the tab-nav link, so scope to the first match.
        this.pageHeading = page.getByText('Assign Leave', { exact: true }).first();
    }

    async open() {
        await this.goto(URLS.LEAVE_ASSIGN);
        await this.expectVisible(this.pageHeading);
    }
}
