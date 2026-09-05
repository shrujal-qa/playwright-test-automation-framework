import { test, expect } from '../../../lib/fixtures';
import { ENV } from '../../../config/env';
import { USER_ROLES } from '../../../lib/data/constants/roles';
import { UI_CONSTANTS } from '../../../lib/data/constants/ui-constants';

const loginUiCases = UI_CONSTANTS.ELEMENTS.LOGIN_PAGE;
const dashboardUiCases = UI_CONSTANTS.ELEMENTS.DASHBOARD;

test.describe('UI Element Data Validation', () => {
    for (const uiElement of loginUiCases) {
        test(
            `UI-001: ${uiElement.name} is visible on the login page`,
            { tag: ['@regression', '@validation'] },
            async ({ page }) => {
                await page.goto(ENV.BASE_URL);
                await expect(page.getByRole(uiElement.role, { name: uiElement.selector })).toBeVisible();
            }
        );
    }

    for (const uiElement of dashboardUiCases) {
        test(
            `UI-002: ${uiElement.name} is visible on the dashboard`,
            { tag: ['@regression', '@validation'] },
            async ({ loginAs, page }) => {
                await loginAs(USER_ROLES.USER);
                await expect(page.getByRole(uiElement.role, { name: uiElement.selector })).toBeVisible();
            }
        );
    }
});
