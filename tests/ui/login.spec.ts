import { LogInPage } from "@pages/LogInSignUpPage";
import { test } from "@fixtures/ui/auth";
import { invalidLoginData, validAccInfo } from "@data/ui/account";
import { BaseValidator } from "@core/api/BaseValidator";
import { getRequiredField } from "@utils/helpers";
import { HomePage } from "@pages/HomePage";

const validEmail = getRequiredField(validAccInfo, "email");
const validPassword = getRequiredField(validAccInfo, "password");
const validName = getRequiredField(validAccInfo, "name");

test.beforeAll(async ({ authService }) => {
    console.log(`[Before all hook] Creating test user: ${validEmail}`);
    const response = await authService.createAccount(validAccInfo);
    BaseValidator.validateFieldValue(response, "responseCode", 201);
    console.log(`[Setup] Created test user with email: ${validEmail} for registration tests.`);
});

test.describe("Success Login with valid credentials", () => {
    test("Should login successfully", async ({ page }) => {
        const logInSignUpPage = new LogInPage(page);
        const homePage = new HomePage(page);

        await logInSignUpPage.navigateTo("login");
        await logInSignUpPage.login(validEmail, validPassword);
        await homePage.header.verifyLoggedInAsText(`Logged in as ${validName}`);
    });
});

test.describe("Login unsuccessfully with invalid credentials", () => {
    for (const testCase of invalidLoginData) {
        test(`Should unsuccessfully login when "${testCase.name}"`, async ({ page }) => {
            const data = getRequiredField(testCase, "data");
            const expectedFieldError = testCase.expectedFieldError;
            const errorMessage = testCase.errorMessage;

            const logInSignUpPage = new LogInPage(page);
            const homePage = new HomePage(page);

            await logInSignUpPage.navigateTo("login");
            await logInSignUpPage.login(data.email, data.password);
            if (expectedFieldError) {
                await logInSignUpPage.verifyLoginFormFieldIsInvalid(expectedFieldError);
                await logInSignUpPage.verifyStillOnPage();
            } else if (errorMessage) {
                await logInSignUpPage.verifyErrorMessage("login", errorMessage);
                await logInSignUpPage.verifyStillOnPage();
            } else {
                throw new Error(`Test case "${testCase.name}" does not have expectedFieldError or errorMessage defined.`);
            }
        });
    }
});

test.afterAll(async ({ authService }) => {
    console.log(`[After all hook] Attempting to delete test user: ${validEmail}`);
    const payload = {
        email: validEmail,
        password: validPassword,
    };
    const res = await authService.deleteAccount(payload);
    console.log(
        `[Clean up] Attempted to delete test user with email: ${validEmail}. Response code in body: ${res.body.responseCode}.`
    );
});