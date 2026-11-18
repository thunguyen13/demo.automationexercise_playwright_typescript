import { CartProduct } from '@components/CartTable';
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
        console.log(`[TEST] Verify cart after successful registration`);

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
        trackUserForCleanup({ email: userInfo.email, password: userInfo.password });
        await signUpInformationPage.submitInformationForm();
        await accountCreatedPage.verifyCurrentPage();
        await header.clickMenuItem("cart");
        
        await cartTable.verifyProductsInCart(preparedCartProducts);
    });

    test("Verify cart after unsuccessful registration", async ({ page, preparedCartProducts, trackUserForCleanup }) => {
        console.log(`[TEST] Verify cart after unsuccessful registration`);

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
        trackUserForCleanup({ email: userInfo.email, password: "" });
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
    test.beforeAll(async ({ createUser }) => {
        console.log("[BEFORE ALL HOOK] Creating test user: " + userInfo.email);
        await createUser(userInfo);
    });

    test("Verify cart after successful login when account has no cart products", async ({ page, preparedCartProducts }) => {
        console.log(`[TEST] Verify cart after successful login when account has no cart products`);

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
        console.log(`[TEST] Verify cart after unsuccessful login`);

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

    test.afterAll(async ({ trackUserForCleanup }) => {
        console.log(`\n============================================================`);
        console.log("[AFTER ALL HOOK] Delete test user: " + userInfo.email);
        trackUserForCleanup({ email: userInfo.email, password: userInfo.password});
    });
});

test.describe("Cart After Logout", () => {
    test.beforeEach(async ({ createdUser, page }) => {
        console.log("[BEFORE EACH HOOK] Created test user for login tests: " + createdUser.email);

        const loginPage = new LogInSignUpPage(page);
        const header = loginPage.header;
        
        await loginPage.navigateTo();
        await loginPage.login(createdUser.email, createdUser.password);
        await header.verifyLoggedInAsText(createdUser.name);
        await header.verifyItemIsVisible("logOut");
        console.log(`============================================================\n`);
    });

    test("Verify cart after successful logout", async ({ page, preparedCartProducts }) => {
        console.log(`[TEST] Verify cart after successful logout`);

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

    test("Verify cart after logout and login again", async ({ createdUser, page, preparedCartProducts }) => {
        console.log(`[TEST] Verify cart after logout and login again`);

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
        await loginPage.login(createdUser.email, createdUser.password);
        await header.verifyLoggedInAsText(createdUser.name);
        await header.clickMenuItem("cart");

        await cartTable.verifyProductsInCart(preparedCartProducts);
    });
});

test.describe("Cart After Login With Account Has Products In Cart", () => {
    test("Verify cart after successful login including products added with and without login", async ({ createdUser, page }) => {
        console.log(`[TEST] Verify cart after successful login including products added with and without login`);
        
        const loginPage = new LogInSignUpPage(page);
        const productPage = new ProductPage(page);
        const listProduct = productPage.listProduct;
        const productDetailsPage = new ProductDetailsPage(page);
        const cartModal = listProduct.cartModal;
        const cartPage = new CartPage(page);
        const cartTable = cartPage.cartTable;
        const header = loginPage.header;

        const addedProducts: CartProduct[] = [];

        // Login and add products to cart
        await loginPage.navigateTo();
        await loginPage.login(createdUser.email, createdUser.password);
        await header.verifyLoggedInAsText(createdUser.name);
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
        await loginPage.login(createdUser.email, createdUser.password);
        await header.verifyLoggedInAsText(createdUser.name);
        await header.clickMenuItem("cart");

        const mergedProducts = new Map<string, CartProduct>();
        [...addedProducts, ...productDetails].forEach(product => {
            const existing = mergedProducts.get(product.name);
            if (existing) {
                mergedProducts.set(product.name, {
                    ...existing,
                    quantity: existing.quantity + product.quantity
                });
            } else {
                mergedProducts.set(product.name, product);
            }
        });
        const products = Array.from(mergedProducts.values());

        await cartTable.verifyProductsInCart(products);

        // Logout and login again to verify cart still has all products
        await header.clickMenuItem("logOut");
        await header.verifyItemIsHidden("logOut");
        await header.clickMenuItem("signUpLogIn");
        await loginPage.login(createdUser.email, createdUser.password);
        await header.clickMenuItem("cart");

        await cartTable.verifyProductsInCart(products);
    });
});

test.describe("Cart After Back From Checkout", () => {
    test.beforeEach(async ({ createdUser, page }) => {
        console.log("[BEFORE EACH HOOK] Created test user for login tests: " + createdUser.email);

        const loginPage = new LogInSignUpPage(page);
        const header = loginPage.header;
        
        await loginPage.navigateTo();
        await loginPage.login(createdUser.email, createdUser.password);
        await header.verifyLoggedInAsText(createdUser.name);
        console.log(`============================================================\n`);
    });

    test("Verify cart after back from checkout", async ({ page, preparedCartProducts }) => {
        console.log(`[TEST] Verify cart after back from checkout`);

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