import { test } from '../../../lib/fixtures';
import { DirectoryPage } from '../../../lib/pages/directory/DirectoryPage';
import { Logger } from '../../../lib/utils/Logger';

/**
 * Directory Test Suite
 *
 * Read-only — the Directory is a company-wide employee lookup, so these
 * tests only search and filter; nothing is created, edited, or deleted.
 */

test.describe('Directory Tests', () => {
    test(
        'DIR-001: User can navigate to the Directory page',
        { tag: ['@smoke', '@regression'] },
        async ({ userPage, page }, testInfo) => {
            testInfo.annotations.push(
                { type: 'severity', description: 'critical' },
                { type: 'feature', description: 'Directory' }
            );

            Logger.step('Step 1: Navigate to Directory');
            const directory = new DirectoryPage(page);
            await directory.open();

            Logger.step('Step 2: Verify the Directory page has loaded');
            await directory.verifyDirectoryLoaded();

            Logger.info('✅ Directory page accessible');
        }
    );

    test(
        'DIR-002: User can filter the Directory by Job Title',
        { tag: ['@regression'] },
        async ({ userPage, page }, testInfo) => {
            testInfo.annotations.push(
                { type: 'severity', description: 'normal' },
                { type: 'feature', description: 'Directory' }
            );

            Logger.step('Step 1: Navigate to Directory');
            const directory = new DirectoryPage(page);
            await directory.open();

            Logger.step('Step 2: Filter by whichever Job Title is first in the list');
            const jobTitle = await directory.filterByFirstAvailableJobTitle();

            Logger.step('Step 3: Verify at least one matching employee card is shown');
            await directory.verifyAtLeastOneResult();

            Logger.info(`✅ Directory filtered by Job Title "${jobTitle}" returned results`);
        }
    );

    test(
        'DIR-003: User can reset Directory search filters',
        { tag: ['@regression'] },
        async ({ userPage, page }, testInfo) => {
            testInfo.annotations.push(
                { type: 'severity', description: 'normal' },
                { type: 'feature', description: 'Directory' }
            );

            Logger.step('Step 1: Navigate to Directory and apply a filter');
            const directory = new DirectoryPage(page);
            await directory.open();
            await directory.filterByFirstAvailableJobTitle();

            Logger.step('Step 2: Reset the search filters');
            await directory.resetFilters();

            Logger.step('Step 3: Verify the Directory page is still loaded');
            await directory.verifyDirectoryLoaded();

            Logger.info('✅ Directory search filters reset correctly');
        }
    );
});
