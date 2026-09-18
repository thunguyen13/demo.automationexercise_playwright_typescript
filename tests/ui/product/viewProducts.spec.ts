import { BaseVerification } from "@core/ui/BaseVerification";
import { test } from "@fixtures/ui/common";
import { ProductDetailsPage } from "@pages/ProductDetailsPage";
import { ProductPage } from "@pages/ProductPage";
import { getRandomIndexList } from "@utils/helpers";


test.describe("List Products", () => {
    test("Should display list of products with correct header", async ({ page }) => {
        const productPage = new ProductPage(page);
        const listProduct = productPage.listProduct;
        const expectFn = BaseVerification.getExpect();

        await productPage.navigateTo();
        await listProduct.verifyHeaderText(listProduct.HEADER.ALL);
        const productCardCount = await listProduct.getProductCardCount();
        const errorMsg = `Expected at least 1 product card to be displayed, but found ${productCardCount}`;
        await BaseVerification.expectWithLog(
            () => expectFn(productCardCount, errorMsg).toBeGreaterThan(0),
            errorMsg
        );
    });

    test("Should display matching product summary on card and overlay", async ({ page }) => {
        const productPage = new ProductPage(page);
        const listProduct = productPage.listProduct;

        await productPage.navigateTo();
        const productCardCount = await listProduct.getProductCardCount();
        const loopCount = productCardCount > 10 ? 10 : productCardCount;
        const randomIndexes = getRandomIndexList(loopCount, loopCount);
        for (const index of randomIndexes) {
            await test.step(`Verifying product card and overlay match for product at index ${index}`, async () => {
                const productCardInfo = await listProduct.getProductCardInfo({index: index});
                const productOverlayInfo = await listProduct.hoverAndGetOverlayContent({index: index});
                await listProduct.verifyProductMatch(productCardInfo, productOverlayInfo);
            });
        }
    });
}); 

test.describe("Product details", () => {
    test("Should display correct product details when clicking 'View Product' button", async ({ page }) => {
        const productPage = new ProductPage(page);
        const listProduct = productPage.listProduct;
        const productDetailsPage = new ProductDetailsPage(page);

        await productPage.navigateTo();
        const productCardCount = await listProduct.getProductCardCount();
        const loopCount = productCardCount > 5 ? 5 : productCardCount;
        const randomIndexes = getRandomIndexList(loopCount, loopCount);

        for (const index of randomIndexes) {
            await test.step(`Verifying product details for product at index ${index}`, async () => {
                await productPage.navigateTo();
                const productCardInfo = await listProduct.getProductCardInfo({index: index});
                await listProduct.clickViewProductButton({index: index});
                await productDetailsPage.verifyProductSummary(productCardInfo);
            });
        }
    });
});