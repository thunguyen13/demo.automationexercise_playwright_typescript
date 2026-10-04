import { BaseValidator } from "@core/api/BaseValidator";
import { validAccInfo } from "@data/ui/account";
import { test } from "@fixtures/ui/common";
import { AccountCreatedPage } from "@pages/AccountCreatedPage";
import { CartPage, CartProduct } from "@pages/CartPage";
import { LogInSignUpPage } from "@pages/LogInSignUpPage";
import { ProductPage } from "@pages/ProductPage";
import { SignUpInformationPage } from "@pages/SignUpInformationPage";
import { getRandomIndexList, getRandomInt } from '@utils/helpers';

test.describe("Cart After Register", () => {
    test("Verify cart after successful registration", async ({ page, preparedCartProducts, trackUserForCleanup }) => {
        const cartPage = new CartPage(page);
        const checkoutModal = cartPage.checkoutModal;
        const registerPage = new LogInSignUpPage(page);
        const signUpInformationPage = new SignUpInformationPage(page);
        const accountCreatedPage = new AccountCreatedPage(page);
        const header = accountCreatedPage.header;
        const userInfo = validAccInfo;
        userInfo.email = getRandomInt(0, 10) + userInfo.email;

        await cartPage.navigateTo();
        await cartPage.clickProceedToCheckoutButton();
        await checkoutModal.clickRegisterLogin();
        await registerPage.signup(userInfo.name, userInfo.email);
        await signUpInformationPage.fillInformationForm(userInfo);
        await trackUserForCleanup({ email: userInfo.email, password: userInfo.password });
        await signUpInformationPage.submitInformationForm();
        await accountCreatedPage.verifyCurrentPage();

        await header.clickMenuItem("cart");
        await cartPage.verifyProductsInCart(preparedCartProducts);

        await header.clickMenuItem("deleteAccount");
    });

    test("Verify cart after unsuccessful registration", async ({ page, preparedCartProducts, trackUserForCleanup }) => {
        const cartPage = new CartPage(page);
        const checkoutModal = cartPage.checkoutModal;
        const registerPage = new LogInSignUpPage(page);
        const signUpInformationPage = new SignUpInformationPage(page);
        const header = signUpInformationPage.header;
        const name = "Test User";
        const email = getRandomInt(11, 20) + validAccInfo.email;

        await cartPage.navigateTo();
        await cartPage.clickProceedToCheckoutButton();
        await checkoutModal.clickRegisterLogin();
        await registerPage.signup(name, email);
        await trackUserForCleanup({ email: email, password: "" });
        await signUpInformationPage.submitInformationForm();
        await header.clickMenuItem("cart");
        
        await cartPage.verifyProductsInCart(preparedCartProducts);
    });
});

test.describe("Cart After Login", () => {
    const userInfo = validAccInfo;
    test.beforeAll(async ({ authService }) => {
        userInfo.email = getRandomInt(21, 30) + userInfo.email;
        console.log("[BEFORE ALL HOOK] Creating test user for login tests: " + userInfo.email);
        const res = await authService.createAccount(userInfo);
        BaseValidator.validateStatusCode(res, 200);
        console.log("[SETUP] Created test user for login tests: " + userInfo.email);
    });

    test("Verify cart after successful login", async ({ page, preparedCartProducts }) => {
        const cartPage = new CartPage(page);
        const checkoutModal = cartPage.checkoutModal;
        const loginPage = new LogInSignUpPage(page);
        const header = cartPage.header;

        await cartPage.navigateTo();
        await cartPage.clickProceedToCheckoutButton();
        await checkoutModal.clickRegisterLogin();
        await loginPage.login(userInfo.email, userInfo.password);
        await header.clickMenuItem("cart");

        await cartPage.verifyProductsInCart(preparedCartProducts);
    });

    test("Verify cart after unsuccessful login", async ({ page, preparedCartProducts }) => {
        const cartPage = new CartPage(page);
        const checkoutModal = cartPage.checkoutModal;
        const loginPage = new LogInSignUpPage(page);
        const header = cartPage.header;
        const invalidEmail = getRandomInt(31, 40) + userInfo.email;

        await cartPage.navigateTo();
        await cartPage.clickProceedToCheckoutButton();
        await checkoutModal.clickRegisterLogin();
        await loginPage.login(invalidEmail, userInfo.password);
        await loginPage.verifyCurrentPage();
        await header.clickMenuItem("cart");

        await cartPage.verifyProductsInCart(preparedCartProducts);
    });

    test.afterAll(async ({ authService }) => {
        console.log("[AFTER ALL HOOK] Attempting to delete test user for login tests: " + userInfo.email);
        const payload = {
            email: userInfo.email,
            password: userInfo.password,
        };
        const res = await authService.deleteAccount(payload);
        console.log(
            `[TEARDOWN] Deleted test user for login tests: ${userInfo.email}. Response code: ${res.body.responseCode}`
        );
    });
});

test.describe("Cart After Logout", () => {
    const userInfo = validAccInfo;
    test.beforeEach(async ({ authService, page }) => {
        userInfo.email = getRandomInt(41, 50) + userInfo.email;
        console.log("[BEFORE EACH HOOK] Creating test user for login tests: " + userInfo.email);
        const res = await authService.createAccount(userInfo);
        BaseValidator.validateStatusCode(res, 200);
        console.log("[SETUP] Created test user for login tests: " + userInfo.email);

        const loginPage = new LogInSignUpPage(page);
        const header = loginPage.header;
        
        await loginPage.navigateTo();
        await loginPage.login(userInfo.email, userInfo.password);
        await header.verifyItemIsVisible("logOut");
    });

    test("Verify cart after successful logout", async ({ page, preparedCartProducts }) => {
        const cartPage = new CartPage(page);
        const header = cartPage.header;

        await cartPage.navigateTo();
        await cartPage.verifyProductsInCart(preparedCartProducts);
        await header.clickMenuItem("logOut");

        await header.verifyItemIsHidden("logOut");
        await header.clickMenuItem("cart");

        await cartPage.verifyCartIsEmpty();
    });

    test("Verify cart after logout and login again", async ({ page, preparedCartProducts }) => {
        const cartPage = new CartPage(page);
        const loginPage = new LogInSignUpPage(page);
        const header = cartPage.header;

        await cartPage.navigateTo();
        await cartPage.verifyProductsInCart(preparedCartProducts);
        await header.clickMenuItem("logOut");

        await header.verifyItemIsHidden("logOut");
        await header.clickMenuItem("cart");
        await cartPage.verifyCartIsEmpty();

        await header.clickMenuItem("signUpLogIn");
        await loginPage.login(userInfo.email, userInfo.password);

        await header.verifyItemIsVisible("logOut");
        await header.clickMenuItem("cart");

        await cartPage.verifyProductsInCart(preparedCartProducts);
    });

    test.afterEach(async ({ authService }) => {
        console.log("[AFTER ALL HOOK] Attempting to delete test user for login tests: " + userInfo.email);
        const payload = {
            email: userInfo.email,
            password: userInfo.password,
        };
        const res = await authService.deleteAccount(payload);
        console.log(
            `[TEARDOWN] Deleted test user for login tests: ${userInfo.email}. Response code: ${res.body.responseCode}`
        );
    });
});

test.describe("Cart After Login With Account Has Products In Cart", () => {
    const userInfo = validAccInfo;
    const addedProducts: CartProduct[] = [];

    test.beforeEach(async ({ authService, page }) => {
        userInfo.email = getRandomInt(51, 60) + userInfo.email;
        console.log("[BEFORE ALL HOOK] Creating test user for login tests: " + userInfo.email);
        const res = await authService.createAccount(userInfo);
        BaseValidator.validateStatusCode(res, 200);
        console.log("[SETUP] Created test user for login tests: " + userInfo.email);

        const loginPage = new LogInSignUpPage(page);
        const productPage = new ProductPage(page);
        const listProduct = productPage.listProduct;
        const cartModal = listProduct.cartModal;
        const cartPage = new CartPage(page);
        const header = cartPage.header;

        await loginPage.navigateTo();
        await loginPage.login(userInfo.email, userInfo.password);
        await header.clickMenuItem("products");
        const productsCardCount = await listProduct.getProductCardCount();
        const randomIndexes = getRandomIndexList(productsCardCount, 2);
        for (const index of randomIndexes) {
            const productInfo = await listProduct.getProductCardInfo({ index });
            addedProducts.push({
                ...productInfo,
                quantity: 1
            });
            await listProduct.clickAddToCartButton({ index });
            await cartModal.clickContinueShopping();
        }
        await header.clickMenuItem("cart");
        await cartPage.verifyProductsInCart(addedProducts);
        await header.clickMenuItem("logOut");
        await header.verifyItemIsHidden("logOut");
    });

    test("Verify cart after successful login including products added with and without login", async ({ page, preparedCartProducts }) => {
        const cartPage = new CartPage(page);
        const checkoutModal = cartPage.checkoutModal;
        const loginPage = new LogInSignUpPage(page);
        const header = loginPage.header;
        const products = [...addedProducts, ...preparedCartProducts];

        await cartPage.navigateTo();
        await cartPage.clickProceedToCheckoutButton();
        await checkoutModal.clickRegisterLogin();
        await loginPage.login(userInfo.email, userInfo.password);
        await header.clickMenuItem("cart");

        await cartPage.verifyProductsInCart(products);

        await header.clickMenuItem("logOut");
        await header.verifyItemIsHidden("logOut");
        await header.clickMenuItem("signUpLogIn");
        await loginPage.login(userInfo.email, userInfo.password);
        await header.clickMenuItem("cart");

        await cartPage.verifyProductsInCart(products);
    });

    test.afterEach(async ({ authService }) => {
        console.log("[AFTER ALL HOOK] Attempting to delete test user for login tests: " + userInfo.email);
        const payload = {
            email: userInfo.email,
            password: userInfo.password,
        };
        const res = await authService.deleteAccount(payload);
        console.log(
            `[TEARDOWN] Deleted test user for login tests: ${userInfo.email}. Response code: ${res.body.responseCode}`
        );
    });
});