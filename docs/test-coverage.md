# 🧪 Test Coverage

This document catalogues every test case in the framework — including tags,
severity, and intent — so it stays readable as the suite grows.

> 🔁 When you add a new spec, please update this file in the same PR.

---

## At a glance

| Metric           | Value |
| ---------------- | ----- |
| Total test cases | **63**  |
| Smoke            | 18    |
| Regression       | 63    |
| Critical         | 11    |
| Negative         | 9     |
| Validation       | 12    |
| RBAC             | 2     |

Approximate execution time on a single worker against the OrangeHRM demo:

| Suite            | Tests | Duration       |
| ---------------- | ----- | -------------- |
| `@smoke`         | 18    | ~6-8 min        |
| `@regression`    | 63    | ~25-30 min      |
| Full run (incl. setup) | 64 | ~25-30 min  |

CI shards regression across two runners, cutting wall-clock time roughly in half.
Coverage now spans nine modules: Authentication, Dashboard, PIM, Leave, Admin
(System Users), Recruitment, My Info, Directory, and Maintenance
(access-control only).

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

## UI Element Data Validation (`specs/features/ui/ui-elements-data.spec.ts`)

Data-driven checks that iterate `UI_CONSTANTS.ELEMENTS.*` and assert each
element is visible — see `.github/prompts/ui-element-data-tests.prompt.md`.

| Test ID  | Title                                          | Tags                       | Severity |
| -------- | ----------------------------------------------- | --------------------------- | -------- |
| `UI-001` | Each Login Page element (username/password/login button) is visible | `@regression @validation`   | Normal   |
| `UI-002` | Assign Leave element is visible on the dashboard | `@regression @validation`  | Normal   |

---

## PIM (`specs/features/pim/pim.spec.ts`)

Employee lifecycle coverage. Every test that creates an employee deletes it
before finishing, so the shared demo instance stays clean.

| Test ID    | Title                                                    | Tags                              | Severity |
| ---------- | --------------------------------------------------------- | ---------------------------------- | -------- |
| `PIM-001`  | Admin can navigate to PIM Employee List                   | `@smoke @regression`               | Critical |
| `PIM-007`  | User role can view PIM Employee List                       | `@regression`                      | Normal   |
| `PIM-004`  | Admin can reset employee list search filters               | `@regression`                      | Normal   |
| `PIM-002`  | Admin can add and delete a new employee (full lifecycle)   | `@smoke @regression @critical`     | Critical |
| `PIM-003`  | Admin can search employee list by Employee Name            | `@regression`                      | Normal   |
| `PIM-005`  | Admin can update an employee nationality                   | `@regression @critical`            | Critical |
| `PIM-101`  | Add Employee fails with empty First Name and Last Name     | `@regression @validation`          | Normal   |
| `PIM-102`  | Employee list search with non-existent Employee Id shows No Records Found | `@regression @negative` | Normal   |

---

## Leave (`specs/features/leave/leave.spec.ts`)

Apply / view / cancel flows for the requester (ESS), plus the Admin-facing
Leave List search and status filter. Leave dates are generated far in the
future to avoid colliding with other runs on the shared demo.

| Test ID     | Title                                                       | Tags                              | Severity |
| ----------- | ------------------------------------------------------------ | ---------------------------------- | -------- |
| `LEAVE-001` | User can navigate to Apply Leave page                        | `@smoke @regression`               | Critical |
| `LEAVE-002` | User can apply for leave successfully                         | `@smoke @regression @critical`     | Critical |
| `LEAVE-101` | Apply Leave fails when Leave Type is not selected              | `@regression @validation`         | Normal   |
| `LEAVE-102` | Apply Leave rejects a To Date before the From Date              | `@regression @negative`          | Normal   |
| `LEAVE-003` | User can view a submitted leave request in My Leave              | `@regression`                   | Normal   |
| `LEAVE-004` | User can cancel a pending leave request                          | `@regression @critical`         | Critical |
| `LEAVE-005` | Admin can view and search the Leave List                          | `@regression`                 | Normal   |
| `LEAVE-006` | Admin can filter Leave List by Pending Approval status              | `@regression`               | Normal   |

---

## Admin — System Users (`specs/features/admin/admin.spec.ts`)

Full-lifecycle tests create a disposable PIM employee first (so Add User's
Employee Name autocomplete has a guaranteed match), then create/edit/delete
the linked system user, and finally remove the employee.

| Test ID    | Title                                                     | Tags                              | Severity |
| ---------- | ------------------------------------------------------------ | ---------------------------------- | -------- |
| `ADM-001`  | Admin can navigate to System Users list                      | `@smoke @regression`               | Critical |
| `ADM-003`  | Admin can search system users by username                     | `@regression`                     | Normal   |
| `ADM-103`  | Search Users with a non-existent username shows No Records Found | `@regression @negative`       | Normal   |
| `ADM-002`  | Admin can add and delete a new system user (full lifecycle)    | `@smoke @regression @critical`  | Critical |
| `ADM-004`  | Admin can edit a system user status                              | `@regression @critical`       | Critical |
| `ADM-101`  | Add User fails when passwords do not match                        | `@regression @negative`     | Normal   |
| `ADM-102`  | Add User fails with required fields empty                           | `@regression @validation`  | Normal   |

---

## Recruitment (`specs/features/recruitment/recruitment.spec.ts`)

| Test ID    | Title                                                   | Tags                              | Severity |
| ---------- | ---------------------------------------------------------- | ---------------------------------- | -------- |
| `REC-001`  | Admin can navigate to Candidates list                       | `@smoke @regression`               | Critical |
| `REC-104`  | Search Candidates with a non-existent name shows No Records Found | `@regression @negative`      | Normal   |
| `REC-002`  | Admin can add and delete a new candidate (full lifecycle)     | `@smoke @regression @critical`  | Critical |
| `REC-003`  | Admin can search candidates by name                             | `@regression`                 | Normal   |
| `REC-101`  | Add Candidate fails with an invalid email format                  | `@regression @validation`  | Normal   |
| `REC-102`  | Add Candidate fails with required fields empty                      | `@regression @validation`| Normal   |

---

## My Info (`specs/features/my-info/my-info.spec.ts`)

Read-only by design — My Info edits the logged-in employee's real record on
the shared demo, so these tests only navigate and assert visibility.

| Test ID     | Title                                                    | Tags                  | Severity |
| ----------- | ----------------------------------------------------------- | ---------------------- | -------- |
| `MYINFO-001`| User can navigate to My Info page                             | `@smoke @regression`  | Critical |
| `MYINFO-002`| My Info displays the logged-in employee personal details        | `@regression @critical` | Critical |
| `MYINFO-003`| User can navigate to the Contact Details tab                       | `@regression`       | Normal   |
| `MYINFO-004`| User can navigate to the Emergency Contacts tab                       | `@regression`     | Normal   |
| `MYINFO-005`| User can navigate to the Dependents tab                                 | `@regression`   | Normal   |

---

## Directory (`specs/features/directory/directory.spec.ts`)

Read-only company-wide employee lookup.

| Test ID   | Title                                          | Tags                  | Severity |
| --------- | -------------------------------------------------- | ---------------------- | -------- |
| `DIR-001` | User can navigate to the Directory page              | `@smoke @regression`  | Critical |
| `DIR-002` | User can filter the Directory by Job Title              | `@regression`       | Normal   |
| `DIR-003` | User can reset Directory search filters                   | `@regression`     | Normal   |

---

## Maintenance (`specs/features/maintenance/maintenance.spec.ts`)

Maintenance's only real actions are destructive data purges, so this suite
stops at the re-authentication security checkpoint — **no purge action is
ever executed** against the shared demo.

| Test ID     | Title                                                | Tags                       | Severity |
| ----------- | --------------------------------------------------------- | ---------------------------- | -------- |
| `MAINT-001` | Admin can navigate to the Maintenance module                 | `@smoke @regression`        | Critical |
| `MAINT-002` | Admin can pass the checkpoint with the correct password         | `@regression @critical`  | Critical |
| `MAINT-101` | Maintenance checkpoint rejects an incorrect password               | `@regression @negative`| Normal   |

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
npx playwright test specs/features/pim/pim.spec.ts
npx playwright test specs/features/leave/leave.spec.ts
npx playwright test specs/features/admin/admin.spec.ts
npx playwright test specs/features/recruitment/recruitment.spec.ts
npx playwright test specs/features/my-info/my-info.spec.ts
npx playwright test specs/features/directory/directory.spec.ts
npx playwright test specs/features/maintenance/maintenance.spec.ts

# Run by Test ID prefix (e.g. all AUTH-1xx negative tests, or a whole module)
npx playwright test --grep "AUTH-10"
npx playwright test --grep "PIM-"
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

- [x] **PIM module** — employee CRUD coverage
- [x] **Leave module** — apply / cancel flows (approve is out of scope — it
      needs a second, distinct role account the shared demo doesn't provide)
- [x] **Admin module** — system user CRUD coverage
- [x] **Recruitment module** — candidate CRUD coverage
- [x] **My Info module** — read-only ESS profile checks
- [x] **Directory module** — read-only company lookup
- [x] **Maintenance module** — security checkpoint only (no destructive purge)
- [ ] **Time module** — timesheet submission
- [ ] **Performance module** — tracker / review coverage
- [ ] **Buzz module** — intentionally skipped for automation: posts are
      permanent on the shared public demo with no delete/cleanup path
- [ ] **API layer** — token-based authentication and request fixtures
- [ ] **Visual regression** — page-level screenshot diffs
- [ ] **Cross-browser** — Firefox + WebKit matrix in CI
- [ ] **Mobile viewport** — responsive checks for key flows
- [ ] **Accessibility** — automated WCAG audits via axe-core
