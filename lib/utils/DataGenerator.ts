/* -------------------------------------------------------
 * DataGenerator Utility
 * -------------------------------------------------------
 * Purpose:
 * - Generate random & unique test data
 * - Enforce PW_{Entity}_{ID} pattern for traceability
 * -------------------------------------------------------
 */

import { APP_CONSTANTS } from '../data/constants/app-constants';

export class DataGenerator {
    /* ---------------------------
       Core Generators
    ---------------------------- */

    private static uniqueIdentifier(length = 6): string {
        return `${Date.now().toString(36)}${Math.random().toString(36).substring(2, 2 + length)}`;
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

    /**
     * Like `entityName()`, but guarantees the result never exceeds
     * `maxLength` — for fields with a hard character cap (e.g. OrangeHRM's
     * PIM Employee Name fields cap at 30 characters and reject longer
     * input outright). Truncates the unique suffix rather than the entity
     * type, so the name stays readable and still traceable back to the
     * test that created it.
     */
    static shortEntityName(entityType: string, maxLength = 30): string {
        const full = this.entityName(entityType);
        return full.length <= maxLength ? full : full.slice(0, maxLength);
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
        return Math.floor(
            Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1)
        ).toString();
    }

    static phone(): string {
        return `9${this.number(9)}`;
    }

    /** Meets OrangeHRM's password composition guidance (upper, lower, digit, symbol). */
    static password(): string {
        return `Pw_${this.uniqueIdentifier(6)}!A1`;
    }

    static date(offsetDays = 0): string {
        const date = new Date();
        date.setDate(date.getDate() + offsetDays);
        return date.toISOString().split('T')[0];
    }
}
