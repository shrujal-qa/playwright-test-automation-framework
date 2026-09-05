/**
 * UI Constants
 * Contains: UI labels, button text, structural text
 */
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
            { name: 'username', role: 'textbox', selector: 'username' },
            { name: 'password', role: 'textbox', selector: 'password' },
            { name: 'login button', role: 'button', selector: /login/i },
        ],
        DASHBOARD: [
            { name: 'Assign Leave', role: 'link', selector: /Assign Leave/i },
        ],
    },
} as const;
