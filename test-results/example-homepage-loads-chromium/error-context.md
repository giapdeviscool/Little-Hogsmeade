# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: example.spec.ts >> homepage loads
- Location: e2e\example.spec.ts:3:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: Test timeout of 30000ms exceeded.
Call log:
  - navigating to "http://localhost:5173/", waiting until "load"

```

# Test source

```ts
  1 | import { test, expect } from "@playwright/test";
  2 | 
  3 | test("homepage loads", async ({ page }) => {
> 4 |   await page.goto("/");
    |              ^ Error: page.goto: Test timeout of 30000ms exceeded.
  5 |   await expect(page).toHaveTitle(/Little Hogsmeade/);
  6 | });
  7 | 
```