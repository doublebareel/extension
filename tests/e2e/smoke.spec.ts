import { test, expect } from "@playwright/test";

test("a highlighted span renders its text", async ({ page }) =>
{
    await page.setContent(
        '<span style="background-color: yellow">highlighted text</span>'
    );

    const highlight = page.locator("span");

    await expect(highlight).toHaveText("highlighted text");
});
