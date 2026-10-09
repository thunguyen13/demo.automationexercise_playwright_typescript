import { BaseValidator } from "@core/api/BaseValidator";
import { validAccInfo } from "@data/ui/account";
import { test } from "@fixtures/ui/common";
import { AccountCreatedPage } from "@pages/AccountCreatedPage";
import { CartPage, CartProduct } from "@pages/CartPage";
import { CheckoutPage } from "@pages/CheckoutPage";
import { LogInSignUpPage } from "@pages/LogInSignUpPage";
import { ProductDetailsPage } from "@pages/ProductDetailsPage";
import { ProductPage } from "@pages/ProductPage";
import { SignUpInformationPage } from "@pages/SignUpInformationPage";
import { getRandomIndexList, getRandomInt } from '@utils/helpers';

const userInfo = validAccInfo;

test.describe("Cart After Register", () => {
    test("Verify cart after successful registration", async ({ page, preparedCartProducts, trackUserForCleanup }) => {
        const cartPage = new CartPage(page);
        const checkoutModal = cartPage.checkoutModal;
        const registerPage = new LogInSignUpPage(page);
        const signUpInformationPage = new SignUpInformationPage(page);
        const accountCreatedPage = new AccountCreatedPage(page);
        const header = accountCreatedPage.header;
        userInfo.email = getRandomInt(0, 9) + userInfo.email;

        await cartPage.navigateTo();
        await cartPage.verifyProductsInCart(preparedCartProducts);
        await cartPage.clickProceedToCheckoutButton();
        await checkoutModal.clickRegisterLogin();
        await registerPage.signup(userInfo.name, userInfo.email);
        await signUpInformationPage.fillInformationForm(userInfo);
        await trackUserForCleanup({ email: userInfo.email, password: userInfo.password });
        await signUpInformationPage.submitInformationForm();
        await accountCreatedPage.verifyCurrentPage();
        await header.clickMenuItem("cart");
        
        await cartPage.verifyProductsInCart(preparedCartProducts);
    });

    test("Verify cart after unsuccessful registration", async ({ page, preparedCartProducts, trackUserForCleanup }) => {
        const cartPage = new CartPage(page);
        const checkoutModal = cartPage.checkoutModal;
        const registerPage = new LogInSignUpPage(page);
        const signUpInformationPage = new SignUpInformationPage(page);
        const header = signUpInformationPage.header;
        userInfo.email = getRandomInt(0, 9) + userInfo.email;

        await cartPage.navigateTo();
        await cartPage.verifyProductsInCart(preparedCartProducts);
        await cartPage.clickProceedToCheckoutButton();
        await checkoutModal.clickRegisterLogin();
        await registerPage.signup(userInfo.name, userInfo.email);
        await trackUserForCleanup({ email: userInfo.email, password: "" });
        await signUpInformationPage.submitInformationForm();
        await signUpInformationPage.verifyCurrentPage();
        await header.clickMenuItem("cart");
        
        await cartPage.verifyProductsInCart(preparedCartProducts);
    });
});

test.describe("Cart After Login", () => {
    test.beforeAll(async ({ authService }) => {
        userInfo.email = getRandomInt(0, 9) + userInfo.email;
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
        await cartPage.verifyProductsInCart(preparedCartProducts);
        await cartPage.clickProceedToCheckoutButton();
        await checkoutModal.clickRegisterLogin();
        await loginPage.login(userInfo.email, userInfo.password);
        await header.verifyLoggedInAsText(userInfo.name);
        await header.clickMenuItem("cart");

        await cartPage.verifyProductsInCart(preparedCartProducts);
    });

    test("Verify cart after unsuccessful login", async ({ page, preparedCartProducts }) => {
        const cartPage = new CartPage(page);
        const checkoutModal = cartPage.checkoutModal;
        const loginPage = new LogInSignUpPage(page);
        const header = cartPage.header;
        const invalidEmail = getRandomInt(10, 19) + userInfo.email;

        await cartPage.navigateTo();
        await cartPage.verifyProductsInCart(preparedCartProducts);
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
    test.beforeEach(async ({ authService, page, trackUserForCleanup }) => {
        userInfo.email = getRandomInt(0, 9) + userInfo.email;
        console.log("[BEFORE EACH HOOK] Creating test user for login tests: " + userInfo.email);
        const res = await authService.createAccount(userInfo);
        BaseValidator.validateStatusCode(res, 200);
        console.log("[SETUP] Created test user for login tests: " + userInfo.email);
        await trackUserForCleanup({ email: userInfo.email, password: userInfo.password });

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
        await header.verifyLoggedInAsText(userInfo.name);
        await header.clickMenuItem("cart");

        await cartPage.verifyProductsInCart(preparedCartProducts);
    });
});

test.describe("Cart After Login With Account Has Products In Cart", () => {
    const addedProducts: CartProduct[] = [];

    test.beforeEach(async ({ authService, trackUserForCleanup }) => {
        userInfo.email = getRandomInt(0, 9) + userInfo.email;
        console.log("[BEFORE EACH HOOK] Creating test user for login tests: " + userInfo.email);
        const res = await authService.createAccount(userInfo);
        BaseValidator.validateStatusCode(res, 200);
        console.log("[SETUP] Created test user for login tests: " + userInfo.email);
        await trackUserForCleanup({ email: userInfo.email, password: userInfo.password });
    });

    test("Verify cart after successful login including products added with and without login", async ({ page }) => {
        const loginPage = new LogInSignUpPage(page);
        const productPage = new ProductPage(page);
        const listProduct = productPage.listProduct;
        const productDetailsPage = new ProductDetailsPage(page);
        const cartModal = listProduct.cartModal;
        const cartPage = new CartPage(page);
        const checkoutModal = cartPage.checkoutModal;
        const header = loginPage.header;

        // Login and add products to cart
        await loginPage.navigateTo();
        await loginPage.login(userInfo.email, userInfo.password);
        await header.verifyLoggedInAsText(userInfo.name);
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

        // Add product to cart after logout
        await productPage.navigateTo();
        const randomInt = getRandomInt(0, productsCardCount - 1);
        await listProduct.clickViewProductButton({ index: randomInt });
        const productDetails = [
            {
                ...(await productDetailsPage.getProductDetails()),
                quantity: 1
            }
        ]
        await productDetailsPage.addProductToCart(1);
        await cartModal.clickViewCart();
        
        await cartPage.verifyProductsInCart(productDetails);

        // Login again and verify cart has all products
        await header.clickMenuItem("signUpLogIn");
        await loginPage.login(userInfo.email, userInfo.password);
        await header.verifyLoggedInAsText(userInfo.name);
        await header.clickMenuItem("cart");

        const products = [...addedProducts, ...productDetails];
        await cartPage.verifyProductsInCart(products);

        // Logout and login again to verify cart still has all products
        await header.clickMenuItem("logOut");
        await header.verifyItemIsHidden("logOut");
        await header.clickMenuItem("signUpLogIn");
        await loginPage.login(userInfo.email, userInfo.password);
        await header.clickMenuItem("cart");

        await cartPage.verifyProductsInCart(products);
    });
});

test.describe("Cart After Back From Checkout", () => {
    test.beforeEach(async ({ authService, page, trackUserForCleanup }) => {
        userInfo.email = getRandomInt(0, 9) + userInfo.email;

        console.log("[BEFORE EACH HOOK] Creating test user for login tests: " + userInfo.email);
        const res = await authService.createAccount(userInfo);
        BaseValidator.validateStatusCode(res, 200);
        console.log("[SETUP] Created test user for login tests: " + userInfo.email);
        await trackUserForCleanup({ email: userInfo.email, password: userInfo.password });

        const loginPage = new LogInSignUpPage(page);
        const header = loginPage.header;
        
        await loginPage.navigateTo();
        await loginPage.login(userInfo.email, userInfo.password);
        await header.verifyLoggedInAsText(userInfo.name);
    });

    test("Verify cart after back from checkout", async ({ page, preparedCartProducts }) => {
        const cartPage = new CartPage(page);
        const checkoutPage = new CheckoutPage(page);

        await cartPage.navigateTo();
        await cartPage.verifyProductsInCart(preparedCartProducts);

        await cartPage.clickProceedToCheckoutButton();
        await checkoutPage.verifyCurrentPage();
        await checkoutPage.goBack();

        await cartPage.verifyProductsInCart(preparedCartProducts);
    });
});