import { test } from "@fixtures/ui/common";
import { CartPage, CartProduct } from "@pages/CartPage";
import { ProductPage } from "@pages/ProductPage";

test.describe("Cart empty state", () => {
    test("Verify UI of cart empty state", async ({ page }) => {
        const cartPage = new CartPage(page);

        await cartPage.navigateTo();
        await cartPage.verifyCartIsEmpty();
    });

    test("Verify button 'Here' navigates to product page", async ({ page }) => {
        const cartPage = new CartPage(page);
        const productPage = new ProductPage(page);

        await cartPage.navigateTo();
        await cartPage.clickHereButton();
        await productPage.verifyCurrentPage();
    });
}); 