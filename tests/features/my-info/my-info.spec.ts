import { test } from '../../../lib/fixtures';
import { MyInfoPage } from '../../../lib/pages/my-info/MyInfoPage';
import { Logger } from '../../../lib/utils/Logger';

/**
 * My Info (ESS) Test Suite
 *
 * Read-only by design: these tests only navigate and verify visibility of
 * the logged-in employee's own record and its tabs. They deliberately do
 * not save any change, since My Info edits the shared demo account's real
 * profile data.
 */

test.describe('My Info Tests - Personal Details', () => {
    test(
        'MYINFO-001: User can navigate to My Info page',
        { tag: ['@smoke', '@regression'] },
        async ({ userPage, page }, testInfo) => {
            testInfo.annotations.push(
                { type: 'severity', description: 'critical' },
                { type: 'feature', description: 'My Info' }
            );

            Logger.step('Step 1: Navigate to My Info');
            const myInfo = new MyInfoPage(page);
            await myInfo.open();

            Logger.step('Step 2: Verify Personal Details loaded');
            await myInfo.verifyPersonalDetailsLoaded();

            Logger.info('✅ My Info page accessible');
        }
    );

    test(
        'MYINFO-002: My Info displays the logged-in employee personal details',
        { tag: ['@regression', '@critical'] },
        async ({ userPage, page }, testInfo) => {
            testInfo.annotations.push(
                { type: 'severity', description: 'critical' },
                { type: 'feature', description: 'My Info' }
            );

            Logger.step('Step 1: Navigate to My Info');
            const myInfo = new MyInfoPage(page);
            await myInfo.open();

            Logger.step('Step 2: Verify the employee name and Employee Id are shown');
            await myInfo.verifyPersonalDetailsLoaded();

            Logger.info('✅ Personal details are correctly displayed for the logged-in user');
        }
    );
});

const infoTabs = [
    { id: 'MYINFO-003', name: 'Contact Details' },
    { id: 'MYINFO-004', name: 'Emergency Contacts' },
    { id: 'MYINFO-005', name: 'Dependents' },
];

test.describe('My Info Tests - Tab Navigation', () => {
    for (const { id, name: tabName } of infoTabs) {
        test(
            `${id}: User can navigate to the ${tabName} tab`,
            { tag: ['@regression'] },
            async ({ userPage, page }, testInfo) => {
                testInfo.annotations.push(
                    { type: 'severity', description: 'normal' },
                    { type: 'feature', description: 'My Info' }
                );

                Logger.step('Step 1: Navigate to My Info');
                const myInfo = new MyInfoPage(page);
                await myInfo.open();

                Logger.step(`Step 2: Open the ${tabName} tab`);
                await myInfo.openTab(tabName);

                Logger.step(`Step 3: Verify ${tabName} content is displayed`);
                await myInfo.verifyTabLoaded(tabName);

                Logger.info(`✅ ${tabName} tab loads correctly from My Info`);
            }
        );
    }
});
