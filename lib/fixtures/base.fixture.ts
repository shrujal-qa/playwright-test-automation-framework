import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/auth/LoginPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { UserManagementPage } from '../pages/admin/UserManagementPage';
import { EmployeeListPage } from '../pages/pim/EmployeeListPage';
import { AddEmployeePage } from '../pages/pim/AddEmployeePage';
import { EmployeeDetailsPage } from '../pages/pim/EmployeeDetailsPage';

/**
 * Base Fixture
 * ------------
 * Provides ready-to-use Page Object instances for every test.
 *
 * Every test importing `test` from `lib/fixtures` automatically gets:
 *   - `loginPage`           — `LoginPage` bound to the current `page`
 *   - `dashboardPage`       — `DashboardPage` bound to the current `page`
 *   - `userManagementPage`  — `UserManagementPage` bound to the current `page`
 *   - `employeeListPage`    — `EmployeeListPage` bound to the current `page`
 *   - `addEmployeePage`     — `AddEmployeePage` bound to the current `page`
 *   - `employeeDetailsPage` — `EmployeeDetailsPage` bound to the current `page`
 *
 * Keep this fixture free of authentication or business logic; that belongs
 * in `auth.fixture.ts` and `lib/helpers/*` respectively.
 */
type BaseFixtures = {
    loginPage: LoginPage;
    dashboardPage: DashboardPage;
    userManagementPage: UserManagementPage;
    employeeListPage: EmployeeListPage;
    addEmployeePage: AddEmployeePage;
    employeeDetailsPage: EmployeeDetailsPage;
};

export const test = base.extend<BaseFixtures>({
    loginPage: async ({ page }, use) => {
        await use(new LoginPage(page));
    },

    dashboardPage: async ({ page }, use) => {
        await use(new DashboardPage(page));
    },

    userManagementPage: async ({ page }, use) => {
        await use(new UserManagementPage(page));
    },

    employeeListPage: async ({ page }, use) => {
        await use(new EmployeeListPage(page));
    },

    addEmployeePage: async ({ page }, use) => {
        await use(new AddEmployeePage(page));
    },

    employeeDetailsPage: async ({ page }, use) => {
        await use(new EmployeeDetailsPage(page));
    },
});

export { expect };
