import { test as apiTest } from "@fixtures/api/account";
import { test as base, expect, mergeTests } from "@playwright/test";
import { blockAds } from "@utils/networkHelpers";

interface UIAuthFixtures {
    blockAds: void
}

const uiTest = base.extend<UIAuthFixtures>({
    blockAds: [async ({ page }, use) => {
        await blockAds(page);
        await use();
    }, { auto: true }]
});

const test = mergeTests(uiTest, apiTest);

export { test, expect };