import { CartProduct } from '@components/CartTable';
import { BaseValidator } from "@core/api/BaseValidator";
import { validAccInfo } from "@data/ui/account";
import { test } from "@fixtures/ui/common";
import { AccountCreatedPage } from "@pages/AccountCreatedPage";
import { CartPage } from "@pages/CartPage";
import { CheckoutPage } from "@pages/CheckoutPage";
import { LogInSignUpPage } from "@pages/LogInSignUpPage";
import { ProductDetailsPage } from "@pages/ProductDetailsPage";
import { ProductPage } from "@pages/ProductPage";
import { SignUpInformationPage } from "@pages/SignUpInformationPage";
import { UserInfo } from '@services/AuthService';
import { buildUserData, generateUniqueEmailAndName } from '@utils/dataHelpers';
import { getRandomIndexList, getRandomInt } from '@utils/helpers';

test.describe("Cart After Register", () => {
    test("Verify cart after successful registration", async ({ page, preparedCartProducts, trackUserForCleanup }) => {
        const cartPage = new CartPage(page);
        const cartTable = cartPage.cartTable;
        const checkoutModal = cartPage.checkoutModal;
        const registerPage = new LogInSignUpPage(page);
        const signUpInformationPage = new SignUpInformationPage(page);
        const accountCreatedPage = new AccountCreatedPage(page);
        const header = accountCreatedPage.header;
        const userInfo = buildUserData(validAccInfo, {
            overrides: generateUniqueEmailAndName()
        }) as UserInfo;

        await cartPage.navigateTo();
        await cartTable.verifyProductsInCart(preparedCartProducts);
        await cartPage.clickProceedToCheckoutButton();
        await checkoutModal.clickRegisterLogin();
        await registerPage.signup(userInfo.name, userInfo.email);
        await signUpInformationPage.fillInformationForm(userInfo);
        await trackUserForCleanup({ email: userInfo.email, password: userInfo.password });
        await signUpInformationPage.submitInformationForm();
        await accountCreatedPage.verifyCurrentPage();
        await header.clickMenuItem("cart");
        
        await cartTable.verifyProductsInCart(preparedCartProducts);
    });

    test("Verify cart after unsuccessful registration", async ({ page, preparedCartProducts, trackUserForCleanup }) => {
        const cartPage = new CartPage(page);
        const cartTable = cartPage.cartTable;
        const checkoutModal = cartPage.checkoutModal;
        const registerPage = new LogInSignUpPage(page);
        const signUpInformationPage = new SignUpInformationPage(page);
        const header = signUpInformationPage.header;
        const userInfo = buildUserData(validAccInfo, {
            overrides: generateUniqueEmailAndName()
        }) as UserInfo;

        await cartPage.navigateTo();
        await cartTable.verifyProductsInCart(preparedCartProducts);
        await cartPage.clickProceedToCheckoutButton();
        await checkoutModal.clickRegisterLogin();
        await registerPage.signup(userInfo.name, userInfo.email);
        await trackUserForCleanup({ email: userInfo.email, password: "" });
        await signUpInformationPage.submitInformationForm();
        await signUpInformationPage.verifyCurrentPage();
        await header.clickMenuItem("cart");
        
        await cartTable.verifyProductsInCart(preparedCartProducts);
    });
});

test.describe("Cart After Login", () => {
    const userInfo = buildUserData(validAccInfo, {
        overrides: generateUniqueEmailAndName()
    }) as UserInfo;
    test.beforeAll(async ({ authService }) => {
        console.log("[BEFORE ALL HOOK] Creating test user for login tests: " + userInfo.email);
        const res = await authService.createAccount(userInfo);
        BaseValidator.validateStatusCode(res, 200);
        console.log("[SETUP] Created test user for login tests: " + userInfo.email);
    });

    test("Verify cart after successful login", async ({ page, preparedCartProducts }) => {
        const cartPage = new CartPage(page);
        const cartTable = cartPage.cartTable;
        const checkoutModal = cartPage.checkoutModal;
        const loginPage = new LogInSignUpPage(page);
        const header = cartPage.header;

        await cartPage.navigateTo();
        await cartTable.verifyProductsInCart(preparedCartProducts);
        await cartPage.clickProceedToCheckoutButton();
        await checkoutModal.clickRegisterLogin();
        await loginPage.login(userInfo.email, userInfo.password);
        await header.verifyLoggedInAsText(userInfo.name);
        await header.clickMenuItem("cart");

        await cartTable.verifyProductsInCart(preparedCartProducts);
    });

    test("Verify cart after unsuccessful login", async ({ page, preparedCartProducts }) => {
        const cartPage = new CartPage(page);
        const cartTable = cartPage.cartTable;
        const checkoutModal = cartPage.checkoutModal;
        const loginPage = new LogInSignUpPage(page);
        const header = cartPage.header;
        const invalidEmail = getRandomInt(10, 19) + userInfo.email;

        await cartPage.navigateTo();
        await cartTable.verifyProductsInCart(preparedCartProducts);
        await cartPage.clickProceedToCheckoutButton();
        await checkoutModal.clickRegisterLogin();
        await loginPage.login(invalidEmail, userInfo.password);
        await loginPage.verifyCurrentPage();
        await header.clickMenuItem("cart");

        await cartTable.verifyProductsInCart(preparedCartProducts);
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
    const userInfo = buildUserData(validAccInfo, {
        overrides: generateUniqueEmailAndName()
    }) as UserInfo;
    test.beforeEach(async ({ authService, page, trackUserForCleanup }) => {
        console.log("[BEFORE EACH HOOK] Creating test user for login tests: " + userInfo.email);
        const res = await authService.createAccount(userInfo);
        await trackUserForCleanup({ email: userInfo.email, password: userInfo.password });
        BaseValidator.validateStatusCode(res, 200);
        console.log("[SETUP] Created test user for login tests: " + userInfo.email);

        const loginPage = new LogInSignUpPage(page);
        const header = loginPage.header;
        
        await loginPage.navigateTo();
        await loginPage.login(userInfo.email, userInfo.password);
        await header.verifyLoggedInAsText(userInfo.name);
        await header.verifyItemIsVisible("logOut");
    });

    test("Verify cart after successful logout", async ({ page, preparedCartProducts }) => {
        const cartPage = new CartPage(page);
        const cartTable = cartPage.cartTable;
        const header = cartPage.header;

        await cartPage.navigateTo();
        await cartTable.verifyProductsInCart(preparedCartProducts);
        await header.clickMenuItem("logOut");
        await header.verifyItemIsHidden("logOut");
        await header.clickMenuItem("cart");

        await cartPage.verifyCartIsEmpty();
    });

    test("Verify cart after logout and login again", async ({ page, preparedCartProducts }) => {
        const cartPage = new CartPage(page);
        const cartTable = cartPage.cartTable;
        const loginPage = new LogInSignUpPage(page);
        const header = cartPage.header;

        await cartPage.navigateTo();
        await cartTable.verifyProductsInCart(preparedCartProducts);
        await header.clickMenuItem("logOut");
        await header.verifyItemIsHidden("logOut");
        await header.clickMenuItem("cart");
        await cartPage.verifyCartIsEmpty();
        await header.clickMenuItem("signUpLogIn");
        await loginPage.login(userInfo.email, userInfo.password);
        await header.verifyLoggedInAsText(userInfo.name);
        await header.clickMenuItem("cart");

        await cartTable.verifyProductsInCart(preparedCartProducts);
    });
});

test.describe("Cart After Login With Account Has Products In Cart", () => {
    const addedProducts: CartProduct[] = [];

    const userInfo = buildUserData(validAccInfo, {
        overrides: generateUniqueEmailAndName()
    }) as UserInfo;

    test.beforeEach(async ({ authService, trackUserForCleanup }) => {
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
        const cartTable = cartPage.cartTable;
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
        await cartTable.verifyProductsInCart(addedProducts);
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
        
        await cartTable.verifyProductsInCart(productDetails);

        // Login again and verify cart has all products
        await header.clickMenuItem("signUpLogIn");
        await loginPage.login(userInfo.email, userInfo.password);
        await header.verifyLoggedInAsText(userInfo.name);
        await header.clickMenuItem("cart");

        const products = [...addedProducts, ...productDetails];
        await cartTable.verifyProductsInCart(products);

        // Logout and login again to verify cart still has all products
        await header.clickMenuItem("logOut");
        await header.verifyItemIsHidden("logOut");
        await header.clickMenuItem("signUpLogIn");
        await loginPage.login(userInfo.email, userInfo.password);
        await header.clickMenuItem("cart");

        await cartTable.verifyProductsInCart(products);
    });
});

test.describe("Cart After Back From Checkout", () => {
    const userInfo = buildUserData(validAccInfo, {
        overrides: generateUniqueEmailAndName()
    }) as UserInfo;
    test.beforeEach(async ({ authService, page, trackUserForCleanup }) => {
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
        const cartTable = cartPage.cartTable;
        const checkoutPage = new CheckoutPage(page);

        await cartPage.navigateTo();
        await cartTable.verifyProductsInCart(preparedCartProducts);

        await cartPage.clickProceedToCheckoutButton();
        await checkoutPage.verifyCurrentPage();
        await checkoutPage.goBack();

        await cartTable.verifyProductsInCart(preparedCartProducts);
    });
});