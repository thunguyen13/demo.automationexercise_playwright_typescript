import { test as apiTest } from "@fixtures/api/account";
import { CartProduct } from "@pages/CartPage";
import { HomePage } from "@pages/HomePage";
import { ProductDetailsPage } from "@pages/ProductDetailsPage";
import { test as base, expect, mergeTests } from "@playwright/test";
import { getRandomIndexList, getRandomInt } from "@utils/helpers";
import { blockAds } from "@utils/networkHelpers";

interface UIFixtures {
    blockAds: void;
    preparedCartProducts: CartProduct[];
}

const uiTest = base.extend<UIFixtures>({
    blockAds: [async ({ page }, use) => {
        await blockAds(page);
        await use();
    }, { auto: true }],
    preparedCartProducts: async ({ page }, use) => {
        const homePage = new HomePage(page);
        const listProduct = homePage.listProduct;
        const productDetailsPage = new ProductDetailsPage(page);
        const cartModal = productDetailsPage.cartModal;
        const randomProductsCount = getRandomInt(1, 3);

        await homePage.navigateTo();
        const productCardCount = await listProduct.getProductCardCount();
        const randomIndexes = getRandomIndexList(productCardCount - 1, randomProductsCount);
        const addedProduct: CartProduct[] = [];
        for (const index of randomIndexes) {
            await listProduct.clickViewProductButton({index: index});
            const productInfo = await productDetailsPage.getProductDetails();
            const quantity = getRandomInt(1, 3);
            addedProduct.push({
                ...productInfo,
                quantity
            });
            await productDetailsPage.addProductToCart(quantity);
            await cartModal.clickContinueShopping();
            await productDetailsPage.goBack();
        }

        await use(addedProduct);
    }
});

const test = mergeTests(uiTest, apiTest);

export { test, expect };