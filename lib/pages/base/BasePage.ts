import { Page, Locator, expect } from '@playwright/test';

/* -------------------------------------------------------
 * Base Page
 * -------------------------------------------------------
 * Purpose:
 * - Shared methods for all page objects
 * - Centralized stable interaction logic
 * -------------------------------------------------------
 */

export abstract class BasePage {
    protected readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async goto(url: string, timeout?: number) {
        await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout });
    }

    async click(locator: Locator, timeout?: number) {
        await locator.waitFor({ state: 'visible', timeout });
        await locator.click({ timeout });
    }

    /* ============================
       🔐 STABLE ENTERPRISE INPUT
    ============================ */
    async stableFill(locator: Locator, value: string) {
        await locator.waitFor({ state: 'visible' });

        // Clear using real keyboard (safe)
        await locator.click();
        await locator.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A');
        await locator.press('Backspace');

        // Type sequentially (non-deprecated)
        await locator.pressSequentially(value, { delay: 80 });

        // Hard assertion — prevents silent failures
        await expect(locator).toHaveValue(value, { timeout: 5000 });
    }

    async expectVisible(locator: Locator, message?: string) {
        await expect(locator, message).toBeVisible();
    }

    async expectText(locator: Locator, text: string, message?: string) {
        await expect(locator, message).toHaveText(text);
    }

    /* ============================
       🔽 OXD CUSTOM DROPDOWN / AUTOCOMPLETE
       OrangeHRM's `.oxd-select-text` widgets are not native <select>
       elements, so they need a click-then-pick interaction instead of
       Playwright's `selectOption`.
    ============================ */
    async selectDropdownOption(dropdown: Locator, optionText: string) {
        await this.click(dropdown);
        await this.page
            .locator('.oxd-select-dropdown')
            .getByText(optionText, { exact: true })
            .click();
    }

    async selectAutocompleteOption(input: Locator, searchText: string, optionText?: string) {
        await this.stableFill(input, searchText);
        const suggestion = this.page.locator('.oxd-autocomplete-dropdown').getByText(
            optionText ?? searchText,
            { exact: false }
        );
        await suggestion.first().waitFor({ state: 'visible' });
        await suggestion.first().click();
    }
}
