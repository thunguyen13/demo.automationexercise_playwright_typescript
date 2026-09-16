import { test } from "@fixtures/ui/common";
import { CartPage } from "@pages/CartPage";
import { HomePage } from "@pages/HomePage";
import { ProductDetailsPage } from "@pages/ProductDetailsPage";
import { ProductPage } from "@pages/ProductPage";
import { getRandomInt } from '@utils/helpers';


test.describe("Cart Modal In Product List", () => {
    test("Verify display of cart modal and functionality of 'Continue Shopping' button", async ({ page }) => {
        const homePage = new HomePage(page);
        const listProduct = homePage.listProduct;
        const cartModal = listProduct.cartModal;

        await homePage.navigateTo();
        const productCardCount = await listProduct.getProductCardCount();
        const randomIndex = getRandomInt(0, productCardCount - 1);
        await listProduct.clickAddToCartButton({index: randomIndex});
        await cartModal.verifyCartModalIsVisible();
        await cartModal.clickContinueShopping();
        await cartModal.verifyCartModalIsHidden();
        await homePage.verifyCurrentPage();
    });

    test("Verify display of cart modal and functionality of 'View Cart' button", async ({ page }) => {
        const productPage = new ProductPage(page);
        const listProduct = productPage.listProduct;
        const productDetailsPage = new ProductDetailsPage(page);
        const cartModal = productDetailsPage.cartModal;
        const cartPage = new CartPage(page);

        await productPage.navigateTo();
        const productCardCount = await listProduct.getProductCardCount();
        const randomIndex = getRandomInt(0, productCardCount - 1);
        await listProduct.clickAddToCartButton({index: randomIndex});
        await cartModal.verifyCartModalIsVisible();
        await cartModal.clickViewCart();
        await cartModal.verifyCartModalIsHidden();
        await cartPage.verifyCurrentPage();
    });
}); 

test.describe("Cart Modal In Product Details", () => {
    test("Verify 'Continue Shopping' button closes the cart modal", async ({ page }) => {
        const productPage = new ProductPage(page);
        const listProduct = productPage.listProduct;
        const productDetailsPage = new ProductDetailsPage(page);
        const cartModal = productDetailsPage.cartModal;

        await productPage.navigateTo();
        const productCardCount = await listProduct.getProductCardCount();
        const randomIndex = getRandomInt(0, productCardCount - 1);
        const productInfo = await listProduct.getProductCardInfo({index: randomIndex});
        await listProduct.clickViewProductButton({index: randomIndex});
        await productDetailsPage.addProductToCart();
        await cartModal.verifyCartModalIsVisible();
        await cartModal.clickContinueShopping();
        await cartModal.verifyCartModalIsHidden();
        await productDetailsPage.verifyCurrentPage(productInfo);
    });

    test("Verify 'View Cart' button navigates to the cart page", async ({ page }) => {
        const productPage = new ProductPage(page);
        const listProduct = productPage.listProduct;
        const productDetailsPage = new ProductDetailsPage(page);
        const cartModal = productDetailsPage.cartModal;
        const cartPage = new CartPage(page);

        await productPage.navigateTo();
        const productCardCount = await listProduct.getProductCardCount();
        const randomIndex = getRandomInt(0, productCardCount - 1);
        await listProduct.clickViewProductButton({index: randomIndex});
        await productDetailsPage.addProductToCart();
        await cartModal.verifyCartModalIsVisible();
        await cartModal.clickViewCart();
        await cartModal.verifyCartModalIsHidden();
        await cartPage.verifyCurrentPage();
    });
});

