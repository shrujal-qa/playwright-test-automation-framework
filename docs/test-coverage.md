# 🧪 Test Coverage

This document catalogues every test case in the framework — including tags,
severity, and intent — so it stays readable as the suite grows.

> 🔁 When you add a new spec, please update this file in the same PR.

---

## At a glance

| Metric           | Value |
| ---------------- | ----- |
| Total test cases | **32**  |
| Smoke            | 10    |
| Regression       | 32    |
| Critical         | 5     |
| Negative         | 7     |
| Validation       | 7     |
| RBAC             | 2     |

Approximate execution time on a single worker against the OrangeHRM demo:

| Suite            | Tests | Duration       |
| ---------------- | ----- | -------------- |
| `@smoke`         | 10    | ~3-4 min       |
| `@regression`    | 32    | ~13-16 min     |
| Full run (incl. setup) | 33+ | ~14-18 min  |

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

---

## Authentication (`specs/features/auth/login.spec.ts`)

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

## Dashboard (`specs/features/dashboard/dashboard.spec.ts`)

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

## Admin — User Management (`specs/features/admin/user-management.spec.ts`)

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

## Execution recipes

```bash
# Tag-based slices
npm run test:smoke
npm run test:regression
npm run test:critical
npm run test:negative
npm run test:rbac

# Run a single feature
npx playwright test specs/features/auth/login.spec.ts
npx playwright test specs/features/dashboard/dashboard.spec.ts
npx playwright test specs/features/admin/

# Run by Test ID prefix (e.g. all AUTH-1xx negative tests)
npx playwright test --grep "AUTH-10"
npx playwright test --grep "ADMIN-USER-"
```

---

## Adding new tests

Each new spec should:

1. Live under `specs/features/<module>/<feature>.spec.ts`.
2. Carry a Test ID prefix (e.g. `PIM-001`, `LEAVE-101`).
3. Use the role-based fixtures (`loginAs`, `userPage`, `adminPage`) — no manual login.
4. Use page objects for **all** locators; no inline selectors in specs.
5. Be added to the relevant table in this document.

See [CONTRIBUTING → Adding New Tests](../CONTRIBUTING.md#adding-new-tests).

---

## Roadmap

Planned expansion (contributions welcome):

- [x] **Admin module** — System User CRUD, search/filter, validation
- [ ] **PIM module** — employee CRUD coverage
- [ ] **Leave module** — apply / approve / cancel flows
- [ ] **Time module** — timesheet submission
- [ ] **API layer** — token-based authentication and request fixtures
- [ ] **Visual regression** — page-level screenshot diffs
- [ ] **Cross-browser** — Firefox + WebKit matrix in CI
- [ ] **Mobile viewport** — responsive checks for key flows
- [ ] **Accessibility** — automated WCAG audits via axe-core
