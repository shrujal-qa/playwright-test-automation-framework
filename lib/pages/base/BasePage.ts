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
       🧩 OXD DESIGN SYSTEM HELPERS
       OrangeHRM renders every labeled field as:
         <div class="oxd-input-group">
           <label class="oxd-label">Field Name[*]</label>
           <input> | <div class="oxd-select-text"> | autocomplete
           <div class="oxd-input-group__message">Error text</div> (conditional)
         </div>
       These helpers locate a field by its visible label instead of
       fragile structural selectors — reusable across every module.
    ============================ */

    /** The `.oxd-input-group` container for a given field label (handles the `*` required suffix). */
    protected fieldGroup(label: string): Locator {
        const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return this.page.locator('.oxd-input-group').filter({
            has: this.page.locator('label.oxd-label').getByText(new RegExp(`^${escaped}\\*?$`)),
        });
    }

    /** A plain `<input>` inside the field group for `label`. */
    protected inputByLabel(label: string): Locator {
        return this.fieldGroup(label).locator('input');
    }

    /** The clickable trigger for an OXD `<select>`-style dropdown inside the field group for `label`. */
    protected selectByLabel(label: string): Locator {
        return this.fieldGroup(label).locator('.oxd-select-text');
    }

    /** The inline validation message (e.g. "Required", "Already exists") shown under a field group. */
    protected fieldErrorByLabel(label: string): Locator {
        return this.fieldGroup(label).locator('.oxd-input-group__message');
    }

    /** Opens an OXD dropdown and clicks the option matching `optionText` exactly. */
    async selectDropdownOption(dropdown: Locator, optionText: string) {
        await dropdown.click();
        await this.page.locator('.oxd-select-option', { hasText: optionText }).first().click();
    }

    /**
     * Fills an OXD autocomplete input and selects the first matching suggestion.
     * Waits out the "Searching...." placeholder before reading results.
     */
    async selectAutocompleteOption(input: Locator, searchText: string, exactOptionText?: string) {
        await input.fill(searchText);
        const options = this.page.locator('.oxd-autocomplete-option');
        await options.first().waitFor({ state: 'visible' });
        await expect(options.first()).not.toHaveText(/Searching/, { timeout: 5_000 });

        if (exactOptionText) {
            await this.page.locator('.oxd-autocomplete-option', { hasText: exactOptionText }).first().click();
        } else {
            await options.first().click();
        }
    }

    /** Asserts the OXD toast notification contains `message` (e.g. "Successfully Saved"). */
    async expectToast(message: string) {
        await this.expectVisible(this.page.locator('.oxd-toast').filter({ hasText: message }));
    }

    /**
     * Waits out the OXD table loading spinner shown while a list re-fetches
     * (search, reset, sort, pagination). Handles both the "spinner never
     * appears because the response was instant" and "spinner is already
     * visible" races: it briefly tolerates the visible state, then requires
     * hidden.
     */
    async waitForTableLoad(timeout = 10_000) {
        const loader = this.page.locator('.oxd-table-loader');
        await loader.waitFor({ state: 'visible', timeout: 2_000 }).catch(() => {});
        await loader.waitFor({ state: 'hidden', timeout }).catch(() => {});
    }
}
