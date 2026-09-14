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

    /**
     * Debug helper: describes every visible "Required" validation error on
     * the page by walking up from each one to the nearest ancestor with a
     * short, human-readable text block. Used when a save silently fails
     * validation and it isn't obvious which field is still empty.
     */
    protected async describeRequiredFieldErrors(): Promise<string[]> {
        const requiredErrors = this.page.getByText('Required', { exact: true });
        const count = await requiredErrors.count().catch(() => 0);
        const contexts: string[] = [];
        for (let i = 0; i < count; i++) {
            const context = await requiredErrors
                .nth(i)
                .evaluate((el) => {
                    let node: HTMLElement | null = el.parentElement;
                    for (let depth = 0; depth < 6 && node; depth++) {
                        const text = node.textContent?.replace(/\s+/g, ' ').trim() ?? '';
                        if (text && text.length > 0 && text.length < 150) {
                            return text;
                        }
                        node = node.parentElement;
                    }
                    return el.outerHTML;
                })
                .catch(() => '(could not read containing field)');
            contexts.push(context);
        }
        return contexts;
    }
}
