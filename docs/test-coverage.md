# 🧪 Test Coverage

This document catalogues every test case in the framework — including tags,
severity, and intent — so it stays readable as the suite grows.

> 🔁 When you add a new spec, please update this file in the same PR.

---

## At a glance

| Metric           | Value |
| ---------------- | ----- |
| Total test cases | **44**  |
| Smoke            | 11    |
| Regression       | 44    |
| Critical         | 4     |
| Negative         | 9     |
| Validation       | 9     |
| RBAC             | 2     |
| E2E              | 2     |

Approximate execution time on a single worker against the OrangeHRM demo:

| Suite            | Tests | Duration       |
| ---------------- | ----- | -------------- |
| `@smoke`         | 11    | ~3-4 min       |
| `@regression`    | 44    | ~17-21 min     |
| Full run (incl. setup) | 45+ | ~18-23 min  |

CI shards regression across two runners, cutting wall-clock time roughly in half.

---

## Tag legend

| Tag           | Meaning                                                             |
| ------------- | ------------------------------------------------------------------- |
| `@smoke`      | Fast, high-value happy paths — runs on every PR                      |
| `@regression` | Broader coverage — runs on `master` and nightly                       |
| `@critical`   | Business-critical scenarios                                          |
| `@negative`   | Negative paths (invalid credentials, error responses)                 |
| `@validation` | Form / input validation                                              |
| `@rbac`       | Role-based access control                                            |
| `@e2e`        | Multi-step, cross-cutting lifecycle scenarios                        |
| `@admin`      | Admin module (User Management)                                       |
| `@pim`        | PIM module (Employee Management)                                     |

---

## Authentication (`tests/features/auth/login.spec.ts`)

### Positive

| Test ID    | Title                                                  | Tags                              | Severity |
| ---------- | ------------------------------------------------------ | --------------------------------- | -------- |
| `USER-001` | User can login successfully with valid credentials     | `@smoke @regression @critical`    | Critical |
| `ADMIN-001`| Admin can login successfully with valid credentials    | `@smoke @regression @critical`    | Critical |
| `AUTH-003` | User can login directly using login page               | `@regression`                     | Normal   |

### Negative

| Test ID    | Title                                            | Tags                       | Severity |
| ---------- | ------------------------------------------------ | -------------------------- | -------- |
| `AUTH-101` | Login fails with invalid username                | `@regression @negative`    | Normal   |
| `AUTH-102` | Login fails with invalid password                | `@regression @negative`    | Normal   |
| `AUTH-103` | Login fails with both invalid credentials        | `@regression @negative`    | Normal   |

### Validation

| Test ID    | Title                                  | Tags                         | Severity |
| ---------- | -------------------------------------- | ---------------------------- | -------- |
| `AUTH-104` | Login fails with empty username        | `@regression @validation`    | Normal   |
| `AUTH-105` | Login fails with empty password        | `@regression @validation`    | Normal   |
| `AUTH-106` | Login fails with both fields empty     | `@regression @validation`    | Normal   |

### Role-based access (RBAC)

| Test ID    | Title                                                | Tags                  | Severity |
| ---------- | ---------------------------------------------------- | --------------------- | -------- |
| `ROLE-001` | User and Admin have different access levels          | `@regression @rbac`   | Normal   |
| `ROLE-002` | Admin has full system access                         | `@regression @rbac`   | Normal   |

---

## Dashboard (`tests/features/dashboard/dashboard.spec.ts`)

### User role

| Test ID    | Title                                                  | Tags                  | Severity |
| ---------- | ------------------------------------------------------ | --------------------- | -------- |
| `DASH-001` | User can access dashboard successfully                 | `@smoke @regression`  | Critical |
| `DASH-002` | User dashboard displays Assign Leave option            | `@smoke @regression`  | Normal   |
| `DASH-003` | User can navigate to dashboard directly                | `@regression`         | Normal   |

### Admin role

| Test ID    | Title                                                  | Tags                  | Severity |
| ---------- | ------------------------------------------------------ | --------------------- | -------- |
| `DASH-101` | Admin can access dashboard successfully                | `@smoke @regression`  | Critical |
| `DASH-102` | Admin dashboard displays Assign Leave option           | `@smoke @regression`  | Normal   |
| `DASH-103` | Admin can navigate to dashboard directly               | `@regression`         | Normal   |

### Common

| Test ID    | Title                                       | Tags                  | Severity |
| ---------- | ------------------------------------------- | --------------------- | -------- |
| `DASH-201` | Dashboard Assign Leave option is visible    | `@smoke @regression`  | Normal   |
| `DASH-202` | Dashboard loads after login                 | `@regression`         | Normal   |

---

## UI Element Data Validation (`tests/features/ui/ui-elements-data.spec.ts`)

Data-driven checks that key elements (declared once in `UI_CONSTANTS.ELEMENTS`)
are visible on their page — one generated test per element, per page.

| Test ID   | Title                                             | Tags                    | Severity |
| --------- | -------------------------------------------------- | -------------------------- | -------- |
| `UI-001` | `{element}` is visible on the login page (×3)        | `@regression @validation` | Normal   |
| `UI-002` | `{element}` is visible on the dashboard (×1)          | `@regression @validation` | Normal   |

---

## Admin — User Management (`tests/features/admin/user-management.spec.ts`)

The public OrangeHRM demo is shared with other testers worldwide, so every
scenario that creates data uses a `DataGenerator`-produced unique username
and deletes it before the test ends; scenarios that read shared data assert
structural invariants (every visible row matches the filter) instead of
absolute record counts.

### View & navigation

| Test ID           | Title                                    | Tags                  | Severity |
| ------------------ | ---------------------------------------- | ---------------------- | -------- |
| `ADMIN-USER-001`  | Admin can view the System Users list     | `@smoke @regression @admin` | Normal |

### CRUD lifecycle

| Test ID           | Title                                                          | Tags                                        | Severity |
| ------------------ | --------------------------------------------------------------- | -------------------------------------------- | -------- |
| `ADMIN-USER-002`  | Create, find, and delete a system user (full lifecycle)         | `@smoke @regression @critical @admin @e2e`  | Critical |
| `ADMIN-USER-003`  | Edit an existing user's status                                   | `@regression @admin`                        | Normal   |
| `ADMIN-USER-008`  | Cancel on Add User form discards changes                         | `@regression @admin`                        | Normal   |

### Search & filter

| Test ID           | Title                                                | Tags                   | Severity |
| ------------------ | ------------------------------------------------------ | ------------------------ | -------- |
| `ADMIN-USER-004`  | Search by username returns only the matching record   | `@regression @admin`   | Normal   |
| `ADMIN-USER-005`  | Search by User Role filters the list correctly         | `@regression @admin`   | Normal   |
| `ADMIN-USER-006`  | Search by Status filters the list correctly            | `@regression @admin`   | Normal   |
| `ADMIN-USER-007`  | Reset clears applied filters                            | `@regression @admin`   | Normal   |

### Negative & validation

| Test ID           | Title                                                      | Tags                                          | Severity |
| ------------------ | ------------------------------------------------------------ | ------------------------------------------------ | -------- |
| `ADMIN-USER-101`  | Empty Add User form shows field-level validation             | `@regression @negative @validation @admin`      | Normal   |
| `ADMIN-USER-102`  | Duplicate username is rejected                               | `@regression @negative @admin`                  | Normal   |
| `ADMIN-USER-103`  | Unselected Employee Name is rejected as invalid               | `@regression @negative @validation @admin`      | Normal   |
| `ADMIN-USER-104`  | Mismatched password and confirm password is rejected          | `@regression @negative @validation @admin`      | Normal   |

**Known gap:** true role-based access restriction (an ESS-role login being
blocked from the Admin menu) is not covered — the framework's `USER` and
`ADMIN` fixtures currently resolve to the same demo `Admin` credentials via
`.env`. Add a distinct ESS credential to `.env` / `lib/data/users.ts` to
close this gap.

---

## PIM — Employee Management (`tests/features/pim/employee-management.spec.ts`)

Scope: the Employee List and the Add Employee → Personal Details flow only.
The remaining profile tabs (Contact Details, Emergency Contacts, Dependents,
Immigration, Job, Salary, Qualifications, Memberships) are not yet modeled —
see the roadmap below.

Post-edit lookups use Employee Id (captured at creation time), not Employee
Name search — the name-autocomplete search index observably lags a few
seconds behind a just-made edit on this instance, which would otherwise
make cleanup/verification flaky.

### View & navigation

| Test ID    | Title                                | Tags                     | Severity |
| ---------- | ------------------------------------- | -------------------------- | -------- |
| `PIM-001` | Admin can view the Employee List      | `@smoke @regression @pim` | Normal   |

### CRUD lifecycle

| Test ID    | Title                                                                | Tags                                     | Severity |
| ---------- | ----------------------------------------------------------------------- | ------------------------------------------- | -------- |
| `PIM-002` | Create, find, and delete an employee (full lifecycle)                   | `@smoke @regression @critical @pim @e2e`  | Critical |
| `PIM-003` | Create an employee with a custom Employee Id and middle name             | `@regression @pim`                        | Normal   |
| `PIM-004` | Edit an employee's Personal Details                                      | `@regression @pim`                        | Normal   |
| `PIM-005` | Cancel on Add Employee discards changes                                  | `@regression @pim`                        | Normal   |

### Search, filter & pagination

| Test ID    | Title                                                    | Tags                 | Severity |
| ---------- | ------------------------------------------------------------ | ----------------------- | -------- |
| `PIM-006` | Search by Employee Name returns only the matching record      | `@regression @pim`   | Normal   |
| `PIM-007` | Search by Employee Id returns only the matching record        | `@regression @pim`   | Normal   |
| `PIM-008` | Reset clears applied filters                                   | `@regression @pim`   | Normal   |
| `PIM-009` | Pagination navigates between pages of the Employee List        | `@regression @pim`   | Normal   |

### Negative & validation

| Test ID    | Title                                                      | Tags                                      | Severity |
| ---------- | ------------------------------------------------------------- | -------------------------------------------- | -------- |
| `PIM-101` | Empty Add Employee form shows field-level validation           | `@regression @negative @validation @pim`   | Normal   |
| `PIM-102` | Duplicate Employee Id is rejected                              | `@regression @negative @pim`               | Normal   |

---

## Execution recipes

```bash
# Tag-based slices
npm run test:smoke
npm run test:regression
npm run test:critical
npm run test:negative
npm run test:rbac

# Run a single feature
npx playwright test tests/features/auth/login.spec.ts
npx playwright test tests/features/dashboard/dashboard.spec.ts
npx playwright test tests/features/admin/
npx playwright test tests/features/pim/

# Run by Test ID prefix (e.g. all AUTH-1xx negative tests)
npx playwright test --grep "AUTH-10"
npx playwright test --grep "ADMIN-USER-"
npx playwright test --grep "PIM-"
```

---

## Adding new tests

Each new spec should:

1. Live under `tests/features/<module>/<feature>.spec.ts`.
2. Carry a Test ID prefix (e.g. `PIM-001`, `LEAVE-101`).
3. Use the role-based fixtures (`loginAs`, `userPage`, `adminPage`) — no manual login.
4. Use page objects for **all** locators; no inline selectors in specs.
5. Be added to the relevant table in this document.

See [CONTRIBUTING → Adding New Tests](../CONTRIBUTING.md#adding-new-tests).

---

## Roadmap

Planned expansion (contributions welcome):

- [x] **Admin module** — System User CRUD, search/filter, validation
- [x] **PIM module** — Employee List + Add Employee + Personal Details CRUD, search/filter, pagination, validation
- [ ] **PIM module — remaining tabs** — Contact Details, Emergency Contacts, Dependents, Immigration, Job, Salary, Qualifications, Memberships
- [ ] **Leave module** — apply / approve / cancel flows
- [ ] **Time module** — timesheet submission
- [ ] **API layer** — token-based authentication and request fixtures
- [ ] **Visual regression** — page-level screenshot diffs
- [ ] **Cross-browser** — Firefox + WebKit matrix in CI
- [ ] **Mobile viewport** — responsive checks for key flows
- [ ] **Accessibility** — automated WCAG audits via axe-core
