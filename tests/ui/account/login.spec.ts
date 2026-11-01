import { LogInSignUpPage } from "@pages/LogInSignUpPage";
import { test } from "@fixtures/ui/common";
import { invalidLoginData, validAccInfo } from "@data/ui/account";
import { getRequiredField } from "@utils/helpers";
import { HomePage } from "@pages/HomePage";

const validEmail = getRequiredField(validAccInfo, "email");
const validPassword = getRequiredField(validAccInfo, "password");
const validName = getRequiredField(validAccInfo, "name");

test.describe.configure({ mode: "parallel" });

test.beforeAll(async ({ createUser }) => {
    console.log(`[BEFORE ALL HOOK] Creating test user: ${validEmail}`);
    await createUser(validAccInfo);
});

test.describe("Success Login with valid credentials", () => {
    test("Should login successfully", async ({ page }) => {
        console.log(`[TEST] Logging in user: ${validEmail}`);
        const logInSignUpPage = new LogInSignUpPage(page);
        const homePage = new HomePage(page);

        await logInSignUpPage.navigateTo("login");
        await logInSignUpPage.login(validEmail, validPassword);
        await homePage.header.verifyLoggedInAsText(`${validName}`);
    });
});

test.describe("Login unsuccessfully with invalid credentials", () => {
    for (const testCase of invalidLoginData) {
        test(`Should unsuccessfully login when "${testCase.name}"`, async ({ page }) => {
            console.log(`[TEST] Case: ${testCase.name}`);
            const data = getRequiredField(testCase, "data");
            const expectedFieldError = testCase.expectedFieldError;
            const errorMessage = testCase.errorMessage;

            const logInSignUpPage = new LogInSignUpPage(page);

            await logInSignUpPage.navigateTo("login");
            await logInSignUpPage.login(data.email, data.password);
            if (expectedFieldError) {
                await logInSignUpPage.verifyLoginFormFieldIsInvalid(expectedFieldError);
                await logInSignUpPage.verifyCurrentPage();
            } else if (errorMessage) {
                await logInSignUpPage.verifyErrorMessage("login", errorMessage);
                await logInSignUpPage.verifyCurrentPage();
            } else {
                throw new Error(`Test case "${testCase.name}" does not have expectedFieldError or errorMessage defined.`);
            }
        });
    }
});

test.afterAll(async ({ trackUserForCleanup }) => {
    console.log(`\n============================================================`);
    console.log(`[AFTER ALL HOOK] Deleting test user.`);
    trackUserForCleanup({email: validEmail, password: validPassword});
});