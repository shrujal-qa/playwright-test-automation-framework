# 🧪 Test Coverage

This document catalogues every test case in the framework — including tags,
severity, and intent — so it stays readable as the suite grows.

> 🔁 When you add a new spec, please update this file in the same PR.

---

## At a glance

| Metric           | Value |
| ---------------- | ----- |
| Total test cases | **95**  |
| Smoke            | 27    |
| Regression       | 95    |
| Critical         | 15    |
| Negative         | 16    |
| Validation       | 17    |
| RBAC             | 2     |
| E2E              | 3     |

Approximate execution time on a single worker against the OrangeHRM demo:

| Suite            | Tests | Duration       |
| ---------------- | ----- | -------------- |
| `@smoke`         | 27    | ~9-11 min       |
| `@regression`    | 95    | ~38-44 min      |
| Full run (incl. setup) | 96 | ~38-44 min  |

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
| `@e2e`        | Multi-step, cross-cutting lifecycle scenarios                        |
| `@admin`      | Admin module (User Management)                                       |
| `@pim`        | PIM module (Employee Management)                                     |
| `@leave`      | Leave module (Apply, Leave List, Entitlements, Assign Leave)         |

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

## PIM (`tests/features/pim/pim.spec.ts`)

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

## Leave (`tests/features/leave/leave.spec.ts`)

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

## Admin — System Users (`tests/features/admin/admin.spec.ts`)

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

## Recruitment (`tests/features/recruitment/recruitment.spec.ts`)

| Test ID    | Title                                                   | Tags                              | Severity |
| ---------- | ---------------------------------------------------------- | ---------------------------------- | -------- |
| `REC-001`  | Admin can navigate to Candidates list                       | `@smoke @regression`               | Critical |
| `REC-104`  | Search Candidates with a non-existent name shows No Records Found | `@regression @negative`      | Normal   |
| `REC-002`  | Admin can add and delete a new candidate (full lifecycle)     | `@smoke @regression @critical`  | Critical |
| `REC-003`  | Admin can search candidates by name                             | `@regression`                 | Normal   |
| `REC-101`  | Add Candidate fails with an invalid email format                  | `@regression @validation`  | Normal   |
| `REC-102`  | Add Candidate fails with required fields empty                      | `@regression @validation`| Normal   |

---

## My Info (`tests/features/my-info/my-info.spec.ts`)

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

## Directory (`tests/features/directory/directory.spec.ts`)

Read-only company-wide employee lookup.

| Test ID   | Title                                          | Tags                  | Severity |
| --------- | -------------------------------------------------- | ---------------------- | -------- |
| `DIR-001` | User can navigate to the Directory page              | `@smoke @regression`  | Critical |
| `DIR-002` | User can filter the Directory by Job Title              | `@regression`       | Normal   |
| `DIR-003` | User can reset Directory search filters                   | `@regression`     | Normal   |

---

## Maintenance (`tests/features/maintenance/maintenance.spec.ts`)

Maintenance's only real actions are destructive data purges, so this suite
stops at the re-authentication security checkpoint — **no purge action is
ever executed** against the shared demo.

| Test ID     | Title                                                | Tags                       | Severity |
| ----------- | --------------------------------------------------------- | ---------------------------- | -------- |
| `MAINT-001` | Admin can navigate to the Maintenance module                 | `@smoke @regression`        | Critical |
| `MAINT-002` | Admin can pass the checkpoint with the correct password         | `@regression @critical`  | Critical |
| `MAINT-101` | Maintenance checkpoint rejects an incorrect password               | `@regression @negative`| Normal   |

---

## Leave (`tests/features/leave/leave-management.spec.ts`)

⚠️ **Not yet fully live-verified** — built under a constraint against
running full Playwright suites, using only brief targeted DOM inspections
rather than the full write→run→fix loop used for Admin/PIM. Two specific
things to check when you run this in UI mode:

- `LEAVE-002` (successful Apply Leave): during inspection, clicking Apply
  after a fully valid fill sometimes produced no toast, no navigation, and
  no inline error, even with a non-zero leave balance. `ApplyLeavePage`
  now waits for the async balance/duration lookup to settle before
  submitting, which may fix it — if this test still fails, that's a real
  interaction issue worth digging into, not just a bad locator.
- `AssignLeavePage` only covers navigation (`LEAVE-008`) — its form fields
  and submit button were never confirmed live.

As elsewhere, Leave Type is resolved dynamically at run time
(`selectFirstDropdownOption`) rather than hardcoded, since this demo's
configured leave types are shared, mutable reference data.

### Apply

| Test ID    | Title                                                  | Tags                                        | Severity |
| ---------- | -------------------------------------------------------- | ---------------------------------------------- | -------- |
| `LEAVE-001` | Employee can view the Apply Leave page                   | `@smoke @regression @leave`                   | Normal   |
| `LEAVE-002` | Employee can apply for a single day of leave              | `@smoke @regression @critical @leave`         | Critical |
| `LEAVE-101` | Empty Apply Leave form shows field-level validation        | `@regression @negative @validation @leave`    | Normal   |

### Leave List

| Test ID    | Title                                                     | Tags                     | Severity |
| ---------- | -------------------------------------------------------------- | --------------------------- | -------- |
| `LEAVE-003` | Admin can view the Leave List                                   | `@smoke @regression @leave` | Normal   |
| `LEAVE-004` | Admin can search the Leave List by employee name                 | `@regression @leave`        | Normal   |
| `LEAVE-005` | Reset clears the Employee Name filter on the Leave List            | `@regression @leave`        | Normal   |

### Entitlements

| Test ID    | Title                                                    | Tags                                    | Severity |
| ---------- | -------------------------------------------------------------- | ------------------------------------------ | -------- |
| `LEAVE-006` | Admin can view Leave Entitlements                                | `@smoke @regression @leave`               | Normal   |
| `LEAVE-007` | Add and delete a leave entitlement (full lifecycle)               | `@regression @critical @leave @e2e`       | Critical |

### Assign Leave

| Test ID    | Title                               | Tags                          | Severity |
| ---------- | ----------------------------------- | -------------------------------- | -------- |
| `LEAVE-008` | Admin can view the Assign Leave page  | `@smoke @regression @leave`     | Normal   |

**Known gaps:** Assign Leave create flow, Leave List row-level approve /
reject / cancel actions (rendered behind a kebab menu whose interactions
weren't verified), and the "Show Leave with Status" multi-select filter
(confirmed as a multi-select with removable chips, but not exercised by a
test — a wrong click risks toggling off the default "Pending Approval"
filter rather than adding to it).

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
npx playwright test tests/features/pim/pim.spec.ts
npx playwright test tests/features/leave/leave.spec.ts
npx playwright test tests/features/admin/admin.spec.ts
npx playwright test tests/features/recruitment/recruitment.spec.ts
npx playwright test tests/features/my-info/my-info.spec.ts
npx playwright test tests/features/directory/directory.spec.ts
npx playwright test tests/features/maintenance/maintenance.spec.ts
npx playwright test tests/features/admin/
npx playwright test tests/features/pim/
npx playwright test tests/features/leave/

# Run by Test ID prefix (e.g. all AUTH-1xx negative tests, or a whole module)
npx playwright test --grep "AUTH-10"
npx playwright test --grep "ADMIN-USER-"
npx playwright test --grep "PIM-"
npx playwright test --grep "LEAVE-"
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
- [x] **Leave module** — apply / cancel flows (approve is out of scope — it
      needs a second, distinct role account the shared demo doesn't provide)
- [x] **Leave module** — Apply, Leave List (view/search), Entitlements CRUD, Assign Leave (navigation only) — **not fully live-verified, see the Leave section above**
- [ ] **Leave module — remaining** — Assign Leave create flow, Leave List approve/reject/cancel actions, status multi-select filter
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
