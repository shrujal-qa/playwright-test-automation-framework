/* -------------------------------------------------------
 * DataGenerator Utility
 * -------------------------------------------------------
 * Purpose:
 * - Generate random & unique test data
 * - Enforce PW_{Entity}_{ID} pattern for traceability
 * -------------------------------------------------------
 */

import { randomBytes, randomInt } from 'node:crypto';
import { APP_CONSTANTS } from '../data/constants/app-constants';

export class DataGenerator {
    /* ---------------------------
       Core Generators
    ---------------------------- */

    /**
     * Uses `crypto.randomBytes` rather than `Math.random()` — some of these
     * identifiers end up as test-account usernames/passwords (see
     * `DataGenerator.user`), and CodeQL flags `Math.random()` as an
     * insecure randomness source in that kind of security-sensitive sink.
     */
    private static uniqueIdentifier(length = 6): string {
        const randomPart = randomBytes(8).toString('hex').substring(0, length);
        return `${Date.now()}_${randomPart}`;
    }

    /* ---------------------------
       Enterprise Naming Standards
       Pattern: PW_{Entity}_{UniqueIdentifier}
    ---------------------------- */

    static user(role = 'User'): string {
        return `${APP_CONSTANTS.TEST_PREFIX}_${role}_${this.uniqueIdentifier()}`;
    }

    static email(prefix = 'user', domain = 'testmail.com'): string {
        return `${APP_CONSTANTS.TEST_PREFIX}_${prefix}_${this.uniqueIdentifier()}@${domain}`;
    }

    static entityName(entityType: string): string {
        return `${APP_CONSTANTS.TEST_PREFIX}_${entityType}_${this.uniqueIdentifier()}`;
    }

    /* ---------------------------
       Helper Data
    ---------------------------- */

    static title(prefix = 'Title'): string {
        return this.entityName(prefix);
    }

    static description(prefix = 'Desc'): string {
        return `${APP_CONSTANTS.TEST_PREFIX} ${prefix} ${this.uniqueIdentifier()} - Auto-generated description`;
    }

    static sentence(): string {
        return `Auto generated text ${this.uniqueIdentifier(8)}`;
    }

    static number(length = 4): string {
        const min = Math.pow(10, length - 1);
        const max = Math.pow(10, length) - 1;
        return randomInt(min, max + 1).toString();
    }

    static phone(): string {
        return `9${this.number(9)}`;
    }

    static date(offsetDays = 0): string {
        const date = new Date();
        date.setDate(date.getDate() + offsetDays);
        return date.toISOString().split('T')[0];
    }
}
