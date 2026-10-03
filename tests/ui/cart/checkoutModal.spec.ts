import { test } from "@fixtures/ui/common";
import { CartPage } from "@pages/CartPage";
import { LogInSignUpPage } from "@pages/LogInSignUpPage";


test.describe("Checkout Modal", () => {
    test("Verify display of checkout modal and functionality of 'Continue On Cart' button", async ({ page, preparedCartProducts }) => {
        const cartPage = new CartPage(page);
        const checkoutModal = cartPage.checkoutModal;
        const header = cartPage.header;

        await cartPage.navigateTo();
        await cartPage.clickProceedToCheckoutButton();
        await checkoutModal.verifycheckoutModalIsVisible();
        await checkoutModal.clickContinueOnCart();
        await checkoutModal.verifycheckoutModalIsHidden();
        await header.verifyItemIsSelected("cart");
        await cartPage.verifyCurrentPage();
        await cartPage.verifyProductsInCart(preparedCartProducts);
    });

    test("Verify display of checkout modal and functionality of 'Register / Login' button", async ({ page, preparedCartProducts }) => {
        const cartPage = new CartPage(page);
        const checkoutModal = cartPage.checkoutModal;
        const loginPage = new LogInSignUpPage(page);
        const header = cartPage.header;

        await cartPage.navigateTo();
        await cartPage.clickProceedToCheckoutButton();
        await checkoutModal.verifycheckoutModalIsVisible();
        await checkoutModal.clickRegisterLogin();
        await checkoutModal.verifycheckoutModalIsHidden();
        await header.verifyItemIsSelected("signUpLogIn");
        await loginPage.verifyCurrentPage();
        await header.clickMenuItem("cart");
        await cartPage.verifyProductsInCart(preparedCartProducts);
    });
});