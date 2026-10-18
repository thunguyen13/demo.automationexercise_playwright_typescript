import { BaseValidator } from "@core/api/BaseValidator";
import { validAccInfo } from "@data/ui/account";
import { test } from "@fixtures/ui/common";
import { CartPage } from "@pages/CartPage";
import { CheckoutPage } from "@pages/CheckoutPage";
import { LogInSignUpPage } from "@pages/LogInSignUpPage";
import { UserInfo } from "@services/AuthService";
import { buildUserData, generateUniqueEmailAndName } from "@utils/dataHelpers";


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
    const userInfo = buildUserData(validAccInfo, {
        overrides: generateUniqueEmailAndName()
    }) as UserInfo;
    
    test.beforeEach(async ({ authService, page, trackUserForCleanup }) => {
        console.log("[BEFORE EACH HOOK] Creating test user for login tests: " + userInfo.email);
        const res = await authService.createAccount(userInfo);
        await trackUserForCleanup({ email: userInfo.email, password: userInfo.password });
        BaseValidator.validateStatusCode(res, 200);
        console.log("[SETUP] Created test user for login tests: " + userInfo.email);
    });

    test("Verify that logged-in users do not see the checkout modal", async ({ page, preparedCartProducts,  }) => {
        const loginPage = new LogInSignUpPage(page);
        const header = loginPage.header;
        const cartPage = new CartPage(page);
        const checkoutModal = cartPage.checkoutModal;
        const checkoutPage = new CheckoutPage(page);

        await loginPage.navigateTo();
        await loginPage.login(userInfo.email, userInfo.password);
        await header.verifyLoggedInAsText(userInfo.name);
        await header.clickMenuItem("cart");

        await cartPage.clickProceedToCheckoutButton();
        await checkoutModal.verifycheckoutModalIsHidden();
        await checkoutPage.verifyCurrentPage();
    });
});