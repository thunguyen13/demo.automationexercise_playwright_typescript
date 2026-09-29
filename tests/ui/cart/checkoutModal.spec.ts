import { test } from "@fixtures/ui/common";
import { CartPage, CartProduct } from "@pages/CartPage";
import { HomePage } from "@pages/HomePage";
import { LogInSignUpPage } from "@pages/LogInSignUpPage";
import { getRandomIndexList, getRandomInt } from '@utils/helpers';

test.describe("Checkout Modal In Product Details", () => {
    test("Verify display of checkout modal and functionality of 'Continue On Cart' button", async ({ page }) => {
        const homePage = new HomePage(page);
        const header = homePage.header;
        const listProduct = homePage.listProduct;
        const cartModal = listProduct.cartModal;
        const cartPage = new CartPage(page);
        const checkoutModal = cartPage.checkoutModal;

        await homePage.navigateTo();
        const productCardCount = await listProduct.getProductCardCount();
        const randomIndexes = getRandomIndexList(productCardCount - 1, 2);
        const addedProduct: CartProduct[] = [];
        for (const index of randomIndexes) {
            const productInfo = await listProduct.getProductCardInfo({ index });
            await listProduct.clickAddToCartButton({ index });
            await cartModal.clickContinueShopping();
            addedProduct.push({
                ...productInfo,
                quantity: 1
            });
        }
        await header.clickMenuItem("cart");
        await cartPage.clickProceedToCheckoutButton();
        await checkoutModal.verifycheckoutModalIsVisible();
        await checkoutModal.clickContinueOnCart();
        await checkoutModal.verifycheckoutModalIsHidden();
        await header.verifyItemIsSelected("cart");
        await cartPage.verifyCurrentPage();
        await cartPage.verifyProductsInCart(addedProduct);
    });

    test("Verify display of checkout modal and functionality of 'Register / Login' button", async ({ page }) => {
        const homePage = new HomePage(page);
        const listProduct = homePage.listProduct;
        const cartModal = listProduct.cartModal;
        const cartPage = new CartPage(page);
        const checkoutModal = cartPage.checkoutModal;
        const loginPage = new LogInSignUpPage(page);
        const header = loginPage.header;

        await homePage.navigateTo();
        const productCardCount = await listProduct.getProductCardCount();
        const randomIndex = getRandomInt(0, productCardCount - 1);
        await listProduct.clickAddToCartButton({index: randomIndex});
        await cartModal.clickViewCart();
        await cartPage.clickProceedToCheckoutButton();
        await checkoutModal.verifycheckoutModalIsVisible();
        await checkoutModal.clickRegisterLogin();
        await checkoutModal.verifycheckoutModalIsHidden();
        await header.verifyItemIsSelected("signUpLogIn");
        await loginPage.verifyCurrentPage();
    });
});

