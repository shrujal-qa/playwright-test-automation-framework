# UI Element Data Test Skill

Use this workflow when adding validation coverage for page UI elements:

1. Add the element metadata to the shared UI constants file.
2. Keep each UI item as a small object with:
   - `name`
   - `role`
   - `selector`
3. Create a data-driven Playwright test loop that iterates through the UI dataset.
4. Validate each element with `expect(page.getByRole(...)).toBeVisible()`.
5. Reuse the same data set for login, dashboard, and future pages.

Example pattern:

```ts
const uiCases = UI_CONSTANTS.ELEMENTS.LOGIN_PAGE;

for (const uiElement of uiCases) {
  test(`UI: ${uiElement.name}`, async ({ page }) => {
    await page.goto(ENV.BASE_URL);
    await expect(page.getByRole(uiElement.role, { name: uiElement.selector })).toBeVisible();
  });
}
```

This keeps UI coverage consistent, readable, and easier to extend across the whole project.
