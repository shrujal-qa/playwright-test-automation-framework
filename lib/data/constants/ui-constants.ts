/**
 * UI Constants
 * Contains: UI labels, button text, structural text
 */
import type { Page } from '@playwright/test';

export const UI_CONSTANTS = {
    BUTTONS: {
        LOGIN: 'login',
        SUBMIT: 'submit',
        CANCEL: 'cancel',
    },
    LABELS: {
        USERNAME: 'username',
        PASSWORD: 'password',
    },
    MENU_OPTIONS: {
        ASSIGN_LEAVE: 'Assign Leave',
    },
    ELEMENTS: {
        LOGIN_PAGE: [
            { name: 'username', locator: (page: Page) => page.getByPlaceholder(/username/i) },
            { name: 'password', locator: (page: Page) => page.getByPlaceholder(/password/i) },
            { name: 'login button', locator: (page: Page) => page.getByRole('button', { name: /login/i }) },
        ],
        DASHBOARD: [
            { name: 'Assign Leave', locator: (page: Page) => page.getByText(/Assign Leave/i) },
        ],
    },
} as const;
