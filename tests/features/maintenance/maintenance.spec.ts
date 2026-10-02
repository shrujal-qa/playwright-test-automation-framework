import { test } from '../../../lib/fixtures';
import { MaintenancePage } from '../../../lib/pages/maintenance/MaintenancePage';
import { USERS } from '../../../lib/data/users';
import { USER_ROLES } from '../../../lib/data/constants/roles';
import { Logger } from '../../../lib/utils/Logger';

/**
 * Maintenance Module Test Suite — Security Checkpoint Only
 *
 * Maintenance's only real actions are destructive data purges, so this
 * suite verifies the re-authentication checkpoint (positive and negative)
 * and stops there — no purge is ever executed against the shared demo.
 */

test.describe('Maintenance Tests - Security Checkpoint', () => {
    test(
        'MAINT-001: Admin can navigate to the Maintenance module',
        { tag: ['@smoke', '@regression'] },
        async ({ adminPage, page }, testInfo) => {
            testInfo.annotations.push(
                { type: 'severity', description: 'critical' },
                { type: 'feature', description: 'Maintenance' }
            );

            Logger.step('Step 1: Navigate to Maintenance');
            const maintenance = new MaintenancePage(page);
            await maintenance.open();

            Logger.step('Step 2: Verify the security checkpoint is displayed');
            await maintenance.verifyCheckpointDisplayed();

            Logger.info('✅ Maintenance checkpoint displayed for Admin');
        }
    );

    test(
        'MAINT-002: Admin can pass the checkpoint with the correct password',
        { tag: ['@regression', '@critical'] },
        async ({ adminPage, page }, testInfo) => {
            testInfo.annotations.push(
                { type: 'severity', description: 'critical' },
                { type: 'feature', description: 'Maintenance' },
                { type: 'story', description: 'MAINT-002: Maintenance checkpoint success' }
            );

            Logger.step('Step 1: Navigate to Maintenance');
            const maintenance = new MaintenancePage(page);
            await maintenance.open();

            Logger.step('Step 2: Submit the correct Admin password');
            await maintenance.submitCheckpointPassword(USERS[USER_ROLES.ADMIN].password);

            Logger.step('Step 3: Verify Purge options become visible — no purge action is triggered');
            await maintenance.verifyPurgeOptionsVisible();

            Logger.info('✅ Maintenance checkpoint accepts the correct password');
        }
    );

    test(
        'MAINT-101: Maintenance checkpoint rejects an incorrect password',
        { tag: ['@regression', '@negative'] },
        async ({ adminPage, page }, testInfo) => {
            testInfo.annotations.push(
                { type: 'severity', description: 'normal' },
                { type: 'feature', description: 'Maintenance' }
            );

            Logger.step('Step 1: Navigate to Maintenance');
            const maintenance = new MaintenancePage(page);
            await maintenance.open();

            Logger.step('Step 2: Submit an incorrect password');
            await maintenance.submitCheckpointPassword('WrongPassword123!');

            Logger.step('Step 3: Verify the checkpoint rejects the request');
            await maintenance.verifyCheckpointRejected();

            Logger.info('✅ Maintenance checkpoint correctly rejects an invalid password');
        }
    );
});
