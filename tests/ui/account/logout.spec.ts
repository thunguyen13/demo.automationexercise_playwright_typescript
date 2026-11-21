import { LogInSignUpPage } from "@pages/LogInSignUpPage";
import { test } from "@fixtures/ui/common";
import { validAccInfo } from "@data/ui/account";
import { BaseValidator } from "@core/api/BaseValidator";
import { getRequiredField } from "@utils/helpers";
import { HomePage } from "@pages/HomePage";

const validEmail = getRequiredField(validAccInfo, "email");
const validPassword = getRequiredField(validAccInfo, "password");
const validName = getRequiredField(validAccInfo, "name");

test.beforeAll(async ({ createUser }) => {
    console.log(`[BEFORE ALL HOOK] Creating test user: ${validEmail}`);
    await createUser(validAccInfo);
});

test.describe("Logout", () => {
    test.beforeEach(async ({ page }) => {
        console.log(`[BEFORE EACH HOOK] Logged in as ${validEmail} before test execution.`);
        const logInSignUpPage = new LogInSignUpPage(page);
        const homePage = new HomePage(page);
        await logInSignUpPage.navigateTo("login");
        await logInSignUpPage.login(validEmail, validPassword);
        await homePage.header.verifyLoggedInAsText(`${validName}`);
        console.log('');
    });
    test("Should logout successfully", async ({ page }) => {
        console.log(`[TEST] Logging out user: ${validEmail}`);
        const homePage = new HomePage(page);
        const logInSignUpPage = new LogInSignUpPage(page);

        await homePage.header.clickMenuItem("logOut");
        await logInSignUpPage.verifyCurrentPage();
        await logInSignUpPage.header.verifyItemIsHidden("loggedInAs");
        await logInSignUpPage.header.verifyItemIsHidden("logOut");
    });
    test("Should logout cross-tab successfully", async ({ page, context }) => {
        console.log(`[TEST] Logging out user: ${validEmail} in one tab and verifying logout session in another tab`);
        const homePage = new HomePage(page);
        const logInSignUpPage = new LogInSignUpPage(page);

        console.log(`[Action] Opening a new tab with logged in user`);
        const newTab = await context.newPage();
        const homePageNewTab = new HomePage(newTab);        
        await homePageNewTab.navigateTo();
        await homePageNewTab.header.verifyLoggedInAsText(`${validName}`);

        console.log(`[Action] Logging out in the first tab`);
        await homePage.header.clickMenuItem("logOut");
        await logInSignUpPage.header.verifyItemIsHidden("logOut");

        console.log(`[Action] Checking the second tab is logged out`);
        await homePageNewTab.header.clickLogo();
        await homePageNewTab.header.verifyItemIsHidden("loggedInAs");
        await homePageNewTab.header.verifyItemIsHidden("logOut");
    });
});

test.afterAll(async ({ trackUserForCleanup }) => {
    console.log(`\n============================================================`);
    console.log(`[AFTER ALL HOOK] Attempting to delete test user: ${validEmail}`);
    trackUserForCleanup({email: validEmail, password: validPassword});
});