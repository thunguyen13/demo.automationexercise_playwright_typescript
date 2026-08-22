import { LogInPage } from "@pages/LogInSignUpPage";
import { test } from "@fixtures/ui/auth";
import { validAccInfo } from "@data/ui/account";
import { BaseValidator } from "@core/api/BaseValidator";
import { getRequiredField } from "@utils/helpers";
import { HomePage } from "@pages/HomePage";

const validEmail = getRequiredField(validAccInfo, "email");
const validPassword = getRequiredField(validAccInfo, "password");
const validName = getRequiredField(validAccInfo, "name");

test.beforeAll(async ({ authService }) => {
    console.log(`[BEFORE ALL HOOK] Creating test user: ${validEmail}`);
    const response = await authService.createAccount(validAccInfo);
    BaseValidator.validateFieldValue(response, "responseCode", 201);
    console.log(`[SETUP] Created test user with email: ${validEmail} for registration tests.`);
});

test.describe("Logout", () => {
    test.beforeEach(async ({ page }) => {
        const logInSignUpPage = new LogInPage(page);
        const homePage = new HomePage(page);
        await logInSignUpPage.navigateTo("login");
        await logInSignUpPage.login(validEmail, validPassword);
        await homePage.header.verifyLoggedInAsText(`Logged in as ${validName}`);
    });
    test("Should logout successfully", async ({ page }) => {
        const homePage = new HomePage(page);
        const logInSignUpPage = new LogInPage(page);

        await homePage.header.clickMenuItem("logOut");
        await logInSignUpPage.verifyCurrentPage();
        await logInSignUpPage.header.verifyItemIsHidden("loggedInAs");
        await logInSignUpPage.header.verifyItemIsHidden("logOut");
    });
    test("Should logout cross-tab successfully", async ({ page, context }) => {
        const homePage = new HomePage(page);
        const logInSignUpPage = new LogInPage(page);

        console.log(`[Action] Opening a new tab with logged in user`);
        const newTab = await context.newPage();
        const homePageNewTab = new HomePage(newTab);        
        await homePageNewTab.navigateTo();
        await homePageNewTab.header.verifyLoggedInAsText(`Logged in as ${validName}`);

        console.log(`[Action] Logging out in the first tab`);
        await homePage.header.clickMenuItem("logOut");
        await logInSignUpPage.header.verifyItemIsHidden("logOut");

        console.log(`[Action] Checking the second tab is logged out`);
        await homePageNewTab.header.clickLogo();
        await homePageNewTab.header.verifyItemIsHidden("loggedInAs");
        await homePageNewTab.header.verifyItemIsHidden("logOut");
    });
});

test.afterAll(async ({ authService }) => {
    console.log(`[AFTER ALL HOOK] Attempting to delete test user: ${validEmail}`);
    const payload = {
        email: validEmail,
        password: validPassword,
    };
    const res = await authService.deleteAccount(payload);
    console.log(
        `[CLEAN UP] Attempted to delete test user with email: ${validEmail}. Response code in body: ${res.body.responseCode}.`
    );
});