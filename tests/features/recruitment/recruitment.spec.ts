import { test } from '../../../lib/fixtures';
import { CandidatesPage } from '../../../lib/pages/recruitment/CandidatesPage';
import { AddCandidatePage } from '../../../lib/pages/recruitment/AddCandidatePage';
import { DataGenerator } from '../../../lib/utils/DataGenerator';
import { Logger } from '../../../lib/utils/Logger';

/**
 * Recruitment Module Test Suite
 *
 * Covers adding, searching and deleting candidates. Every candidate created
 * by a test is deleted before the test finishes to keep the shared demo
 * instance clean.
 */

test.describe('Recruitment Tests - Candidates List', () => {
    test(
        'REC-001: Admin can navigate to Candidates list',
        { tag: ['@smoke', '@regression'] },
        async ({ adminPage, page }, testInfo) => {
            testInfo.annotations.push(
                { type: 'severity', description: 'critical' },
                { type: 'feature', description: 'Recruitment' }
            );

            Logger.step('Step 1: Navigate to Candidates list');
            const candidates = new CandidatesPage(page);
            await candidates.open();

            Logger.step('Step 2: Verify Candidates page has loaded');
            await candidates.verifyListLoaded();

            Logger.info('✅ Candidates list accessible to Admin');
        }
    );

    test(
        'REC-104: Search Candidates with a non-existent name shows No Records Found',
        { tag: ['@regression', '@negative'] },
        async ({ adminPage, page }, testInfo) => {
            testInfo.annotations.push(
                { type: 'severity', description: 'normal' },
                { type: 'feature', description: 'Recruitment' }
            );

            const bogusName = DataGenerator.entityName('NoSuchCandidate');

            Logger.step('Step 1: Navigate to Candidates list');
            const candidates = new CandidatesPage(page);
            await candidates.open();

            Logger.step(`Step 2: Search for a candidate name that cannot exist: ${bogusName}`);
            await candidates.searchByCandidateName(bogusName);

            Logger.step('Step 3: Verify No Records Found is displayed');
            await candidates.verifyNoRecordsFound();

            Logger.info('✅ Non-existent candidate search correctly shows No Records Found');
        }
    );
});

test.describe('Recruitment Tests - Add / Search / Delete Candidate', () => {
    test(
        'REC-002: Admin can add and delete a new candidate (full lifecycle)',
        { tag: ['@smoke', '@regression', '@critical'] },
        async ({ adminPage, page }, testInfo) => {
            testInfo.annotations.push(
                { type: 'severity', description: 'critical' },
                { type: 'feature', description: 'Recruitment' },
                { type: 'story', description: 'REC-002: Candidate CRUD lifecycle' }
            );

            const firstName = DataGenerator.entityName('Candidate');
            const lastName = DataGenerator.entityName('Applicant');
            const fullName = `${firstName} ${lastName}`;
            const email = DataGenerator.email('candidate');

            Logger.step('Step 1: Open Add Candidate form');
            const candidates = new CandidatesPage(page);
            await candidates.open();
            await candidates.clickAddCandidate();

            Logger.step(`Step 2: Fill and save new candidate ${fullName}`);
            const addCandidate = new AddCandidatePage(page);
            await addCandidate.addCandidate(firstName, lastName, email);

            Logger.step('Step 3: Search for the candidate in the list — the strongest proof the save worked');
            await candidates.open();
            await candidates.searchByCandidateName(fullName);
            await candidates.verifyRowVisible(fullName);

            Logger.step('Step 4: Delete the candidate to keep the shared demo clean');
            await candidates.deleteCandidateByName(fullName);

            Logger.info(`✅ Candidate ${fullName} created, verified and deleted successfully`);
        }
    );

    test(
        'REC-003: Admin can search candidates by name',
        { tag: ['@regression'] },
        async ({ adminPage, page }, testInfo) => {
            testInfo.annotations.push(
                { type: 'severity', description: 'normal' },
                { type: 'feature', description: 'Recruitment' }
            );

            const firstName = DataGenerator.entityName('Search');
            const lastName = DataGenerator.entityName('Candidate');
            const fullName = `${firstName} ${lastName}`;
            const email = DataGenerator.email('search-candidate');

            Logger.step(`Step 1: Create a disposable candidate ${fullName}`);
            const candidates = new CandidatesPage(page);
            await candidates.open();
            await candidates.clickAddCandidate();

            const addCandidate = new AddCandidatePage(page);
            await addCandidate.addCandidate(firstName, lastName, email);

            Logger.step('Step 2: Search for the candidate by name');
            await candidates.open();
            await candidates.searchByCandidateName(fullName);

            Logger.step('Step 3: Verify the candidate row appears in the results');
            await candidates.verifyRowVisible(fullName);

            Logger.step('Step 4: Clean up — delete the created candidate');
            await candidates.deleteCandidateByName(fullName);

            Logger.info('✅ Candidate search by name returns the correct record');
        }
    );

    test(
        'REC-101: Add Candidate fails with an invalid email format',
        { tag: ['@regression', '@validation'] },
        async ({ adminPage, page }, testInfo) => {
            testInfo.annotations.push(
                { type: 'severity', description: 'normal' },
                { type: 'feature', description: 'Recruitment' }
            );

            const firstName = DataGenerator.entityName('Invalid');
            const lastName = DataGenerator.entityName('Email');

            Logger.step('Step 1: Open Add Candidate form');
            const candidates = new CandidatesPage(page);
            await candidates.open();
            await candidates.clickAddCandidate();

            Logger.step('Step 2: Fill the form with a malformed email address');
            const addCandidate = new AddCandidatePage(page);
            await addCandidate.addCandidate(firstName, lastName, 'not-an-email');

            Logger.step('Step 3: Verify the invalid email validation is shown');
            await addCandidate.verifyInvalidEmailError();

            Logger.info('✅ Add Candidate correctly rejects an invalid email address');
        }
    );

    test(
        'REC-102: Add Candidate fails with required fields empty',
        { tag: ['@regression', '@validation'] },
        async ({ adminPage, page }, testInfo) => {
            testInfo.annotations.push(
                { type: 'severity', description: 'normal' },
                { type: 'feature', description: 'Recruitment' }
            );

            Logger.step('Step 1: Open Add Candidate form');
            const candidates = new CandidatesPage(page);
            await candidates.open();
            await candidates.clickAddCandidate();

            Logger.step('Step 2: Attempt to save without filling any field');
            const addCandidate = new AddCandidatePage(page);
            await addCandidate.save();

            Logger.step('Step 3: Verify Required field validation is shown');
            await addCandidate.verifyRequiredFieldError();

            Logger.info('✅ Add Candidate correctly rejects empty required fields');
        }
    );
});
