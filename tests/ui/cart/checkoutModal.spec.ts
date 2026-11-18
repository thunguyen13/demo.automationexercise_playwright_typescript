import { test } from "@fixtures/ui/common";
import { CartPage } from "@pages/CartPage";
import { CheckoutPage } from "@pages/CheckoutPage";
import { LogInSignUpPage } from "@pages/LogInSignUpPage";


test.describe("Checkout Modal", () => {
    test("Verify display of checkout modal and functionality of 'Continue On Cart' button", async ({ page, preparedCartProducts }) => {
        const cartPage = new CartPage(page);
        const cartTable = cartPage.cartTable;
        const checkoutModal = cartPage.checkoutModal;
        const header = cartPage.header;

        await cartPage.navigateTo();
        await cartPage.clickProceedToCheckoutButton();
        await checkoutModal.verifycheckoutModalIsVisible();
        await checkoutModal.clickContinueOnCart();
        await checkoutModal.verifycheckoutModalIsHidden();
        await header.verifyItemIsSelected("cart");
        await cartPage.verifyCurrentPage();
        await cartTable.verifyProductsInCart(preparedCartProducts);
    });

    test("Verify display of checkout modal and functionality of 'Register / Login' button", async ({ page, preparedCartProducts }) => {
        const cartPage = new CartPage(page);
        const cartTable = cartPage.cartTable;
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
        await cartTable.verifyProductsInCart(preparedCartProducts);
    });
});

test.describe("No Checkout Modal Displayed for Logged-in Users", () => {
    test("Verify that logged-in users do not see the checkout modal", async ({ createdUser, page, preparedCartProducts }) => {
        const loginPage = new LogInSignUpPage(page);
        const header = loginPage.header;
        const cartPage = new CartPage(page);
        const checkoutModal = cartPage.checkoutModal;
        const checkoutPage = new CheckoutPage(page);

        await loginPage.navigateTo();
        await loginPage.login(createdUser.email, createdUser.password);
        await header.verifyLoggedInAsText(createdUser.name);
        await header.clickMenuItem("cart");

        await cartPage.clickProceedToCheckoutButton();
        await checkoutModal.verifycheckoutModalIsHidden();
        await checkoutPage.verifyCurrentPage();
    });
});