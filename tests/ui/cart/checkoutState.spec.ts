import { CartProduct } from '@components/CartTable';
import { BaseValidator } from "@core/api/BaseValidator";
import { validAccInfo } from "@data/ui/account";
import { test } from "@fixtures/ui/common";
import { CartPage } from "@pages/CartPage";
import { AddressDetails, CheckoutPage } from "@pages/CheckoutPage";
import { LogInSignUpPage } from "@pages/LogInSignUpPage";
import { ProductPage } from "@pages/ProductPage";
import { countryOptions, RequiredFields, requiredFields } from '@pages/SignUpInformationPage';
import { UserInfo } from '@services/AuthService';
import { buildUserData, generateUniqueEmailAndName } from '@utils/dataHelpers';
import { getRandomIndexList, getRandomInt } from '@utils/helpers';

test.describe("Address Details Verification - Full Infomation", () => {
    const userInfo = buildUserData(validAccInfo, {
        overrides: generateUniqueEmailAndName()
    }) as UserInfo;

    test.beforeEach(async ({ page, authService, trackUserForCleanup }) => {
        console.log("[BEFORE ALL HOOK] Creating test user for login tests: " + userInfo.email);
        const res = await authService.createAccount(userInfo);
        await trackUserForCleanup({ email: userInfo.email, password: userInfo.password });
        BaseValidator.validateStatusCode(res, 200);
        console.log("[SETUP] Created test user for login tests: " + userInfo.email);

        const loginPage = new LogInSignUpPage(page);
        const header = loginPage.header;
        
        await loginPage.navigateTo();
        await loginPage.login(userInfo.email, userInfo.password);
        await header.verifyLoggedInAsText(userInfo.name);
    });

    test("Verify address details when account has full information", async ({ page, preparedCartProducts }) => {
        const cartPage = new CartPage(page);
        const cartTable = cartPage.cartTable;
        const checkoutPage = new CheckoutPage(page);
        const addressDetails: AddressDetails = {
            title: userInfo.title,
            firstname: userInfo.firstname,
            lastname: userInfo.lastname,
            address1: userInfo.address1,
            address2: userInfo.address2 || "",
            company: userInfo.company,
            city: userInfo.city,
            state: userInfo.state,
            zipcode: userInfo.zipcode,
            country: typeof userInfo.country === "string" ? userInfo.country : countryOptions[userInfo.country],
            mobile_number: userInfo.mobile_number,
        };

        await cartPage.navigateTo();
        await cartTable.verifyProductsInCart(preparedCartProducts);
        await cartPage.clickProceedToCheckoutButton();
        
        await checkoutPage.verifyCurrentPage();
        await checkoutPage.verifyAddressDetails('billing', addressDetails);
        await checkoutPage.verifyAddressDetails('delivery', addressDetails);
    });
});

test.describe("Address Details Verification - Only Required Infomation", () => {
    const optionalFields = (Object.keys(validAccInfo) as Array<keyof UserInfo>).filter(key => !requiredFields.includes(key as RequiredFields));
    const userInfo = buildUserData(validAccInfo, {
        overrides: generateUniqueEmailAndName(),
        deleteFields: optionalFields
    }) as UserInfo;

    test.beforeEach(async ({ page, authService, trackUserForCleanup }) => {
        console.log("[BEFORE ALL HOOK] Creating test user for login tests: " + userInfo.email);
        const res = await authService.createAccount(userInfo);
        await trackUserForCleanup({ email: userInfo.email, password: userInfo.password });
        BaseValidator.validateStatusCode(res, 200);
        console.log("[SETUP] Created test user for login tests: " + userInfo.email);

        const loginPage = new LogInSignUpPage(page);
        const header = loginPage.header;
        
        await loginPage.navigateTo();
        await loginPage.login(userInfo.email, userInfo.password);
        await header.verifyLoggedInAsText(userInfo.name);
    });

    test("Verify address details when account has full information", async ({ page, preparedCartProducts }) => {
        const cartPage = new CartPage(page);
        const cartTable = cartPage.cartTable;
        const checkoutPage = new CheckoutPage(page);
        const addressDetails: AddressDetails = {
            firstname: userInfo.firstname,
            lastname: userInfo.lastname,
            address1: userInfo.address1,
            city: userInfo.city,
            state: userInfo.state,
            zipcode: userInfo.zipcode,
            country: typeof userInfo.country === "string" ? userInfo.country : countryOptions[userInfo.country],
            mobile_number: userInfo.mobile_number,
        };

        await cartPage.navigateTo();
        await cartTable.verifyProductsInCart(preparedCartProducts);
        await cartPage.clickProceedToCheckoutButton();
        
        await checkoutPage.verifyCurrentPage();
        await checkoutPage.verifyAddressDetails('billing', addressDetails);
        await checkoutPage.verifyAddressDetails('delivery', addressDetails);
    });
});

test.describe("Order Verification", () => {
    const userInfo = buildUserData(validAccInfo, {
        overrides: generateUniqueEmailAndName()
    }) as UserInfo;

    test.beforeEach(async ({ page, authService, trackUserForCleanup }) => {
        console.log("[BEFORE ALL HOOK] Creating test user for login tests: " + userInfo.email);
        const res = await authService.createAccount(userInfo);
        await trackUserForCleanup({ email: userInfo.email, password: userInfo.password });
        BaseValidator.validateStatusCode(res, 200);
        console.log("[SETUP] Created test user for login tests: " + userInfo.email);

        const loginPage = new LogInSignUpPage(page);
        const header = loginPage.header;
        
        await loginPage.navigateTo();
        await loginPage.login(userInfo.email, userInfo.password);
        await header.verifyLoggedInAsText(userInfo.name);
    });

    test("Verify order information matches cart and total amount is correct", async ({ page, preparedCartProducts }) => {
        const cartPage = new CartPage(page);
        const cartTableInCart = cartPage.cartTable;
        const checkoutPage = new CheckoutPage(page);
        const cartTableInCheckout = checkoutPage.cartTable;

        await cartPage.navigateTo();
        await cartTableInCart.verifyProductsInCart(preparedCartProducts);
        await cartPage.clickProceedToCheckoutButton();

        await checkoutPage.verifyCurrentPage();
        await cartTableInCheckout.verifyProductsInCart(preparedCartProducts);
        await checkoutPage.verifyTotalAmount(preparedCartProducts);
    });

    test("Verify order information matches cart after deleting a product and total amount is correct", async ({ page }) => {
        const productPage = new ProductPage(page);
        const listProduct = productPage.listProduct;
        const cartModal = listProduct.cartModal;
        const cartPage = new CartPage(page);
        const cartTableInCart = cartPage.cartTable;
        const checkoutPage = new CheckoutPage(page);
        const cartTableInCheckout = checkoutPage.cartTable;

        await productPage.navigateTo();
        const addedProducts: CartProduct[] = [];
        const productsCardCount = await listProduct.getProductCardCount();
        const randomIndexes = getRandomIndexList(productsCardCount, 3);
        for (const index of randomIndexes) {
            const productInfo = await listProduct.getProductCardInfo({ index });
            addedProducts.push({
                ...productInfo,
                quantity: 1
            });
            await listProduct.clickAddToCartButton({ index });
            await cartModal.clickContinueShopping();
        }

        await cartPage.navigateTo();
        await cartTableInCart.verifyProductsInCart(addedProducts);
        const deleteProduct = addedProducts.splice(getRandomInt(0, addedProducts.length - 1), 1)[0];
        await cartPage.deleteProducts([{
            name: deleteProduct.name,
            price: deleteProduct.price
        }]);
        await cartTableInCart.verifyProductsInCart(addedProducts);
        await cartPage.clickProceedToCheckoutButton();

        await checkoutPage.verifyCurrentPage();
        await cartTableInCheckout.verifyProductsInCart(addedProducts);
        await checkoutPage.verifyTotalAmount(addedProducts);
    });
});

test.describe("Enable to Leave A Comment", () => {
    const userInfo = buildUserData(validAccInfo, {
        overrides: generateUniqueEmailAndName()
    }) as UserInfo;

    test.beforeEach(async ({ page, authService, trackUserForCleanup }) => {
        console.log("[BEFORE ALL HOOK] Creating test user for login tests: " + userInfo.email);
        const res = await authService.createAccount(userInfo);
        await trackUserForCleanup({ email: userInfo.email, password: userInfo.password });
        BaseValidator.validateStatusCode(res, 200);
        console.log("[SETUP] Created test user for login tests: " + userInfo.email);

        const loginPage = new LogInSignUpPage(page);
        const header = loginPage.header;
        
        await loginPage.navigateTo();
        await loginPage.login(userInfo.email, userInfo.password);
        await header.verifyLoggedInAsText(userInfo.name);
    });

    test("Verify user can leave a comment", async ({ page, preparedCartProducts }) => {
        const cartPage = new CartPage(page);
        const checkoutPage = new CheckoutPage(page);
        const comment = "This is a test comment for the order.";

        await cartPage.navigateTo();
        await cartPage.clickProceedToCheckoutButton();

        await checkoutPage.verifyCurrentPage();
        await checkoutPage.verifyOrderMessageAreaDisplayed();
        await checkoutPage.addOrderMessage(comment);
        await checkoutPage.verifyOrderMessage(comment);
    });
});