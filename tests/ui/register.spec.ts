import { LogInPage } from "@pages/LogInSignUpPage";
import { SignUpInformationPage } from "@pages/SignUpInformationPage";
import { test } from "@fixtures/ui/auth";
import { invalidRegisterData_duplicateEmail, invalidRegisterData_invalidFormatField, invalidRegisterData_misingFieldData, validAccInfo } from "@data/ui/accountData";
import { AccountCreatedPage } from "@pages/AccountCreatedPage";
import { BaseValidator } from "@core/api/BaseValidator";
import { getRequiredField } from "@utils/helpers";

const validEmail = getRequiredField(validAccInfo, "email");
const validPassword = getRequiredField(validAccInfo, "password");
const validName = getRequiredField(validAccInfo, "name");

test.describe("Registration flow with valid data", () => {
    test("Should register successfully and navigate to account created page", async ({ page, trackUserForCleanup }) => {
        const logInSignUpPage = new LogInPage(page);
        const signUpInformationPage = new SignUpInformationPage(page);
        const accountCreatedPage = new AccountCreatedPage(page);

        await logInSignUpPage.navigateTo("signup");
        await logInSignUpPage.signup(validName, validEmail);
        await signUpInformationPage.fillInformationForm(validAccInfo);
        await signUpInformationPage.submitInformationForm();
        await trackUserForCleanup({ email: validEmail, password: validPassword });
        await accountCreatedPage.verifyPageContent();
    });
});

test.describe("Account information form auto-filling and disabling", () => {
    test("Should auto-filled name field in information form based on name provided in signup form", async ({ page }) => {
        const logInSignUpPage = new LogInPage(page);
        const signUpInformationPage = new SignUpInformationPage(page);

        await logInSignUpPage.navigateTo("signup");
        await logInSignUpPage.signup(validName, validEmail);
        await signUpInformationPage.verifyAutoFilledData("name", validName);
    });
    test("Should auto-filled and disabled email field in information form based on email provided in signup form", async ({ page }) => {
        const logInSignUpPage = new LogInPage(page);
        const signUpInformationPage = new SignUpInformationPage(page);

        await logInSignUpPage.navigateTo("signup");
        await logInSignUpPage.signup(validName, validEmail);
        await signUpInformationPage.verifyAutoFilledData("email", validEmail);
        await signUpInformationPage.verifyDisabledEmailField();
    });
});

test.describe("Registration flow with empty required fields", () => {
    for (const testCase of invalidRegisterData_misingFieldData) {
        test(`Should display validation when "${testCase.name}"`, async ({ page, trackUserForCleanup }) => {
            const screen = getRequiredField(testCase, "screen");
            const expectedFieldError = getRequiredField(testCase, "expectedFieldError");
            const signupData = getRequiredField(testCase, "data");

            const logInSignUpPage = new LogInPage(page);
            const signUpInformationPage = new SignUpInformationPage(page);
            
            const name = signupData.name ?? "";
            const email = signupData.email ?? "";
            const password = signupData.password ?? "";
            await logInSignUpPage.navigateTo("signup");
            await logInSignUpPage.signup(name, email);
            if (screen === 1) {
                await logInSignUpPage.verifySignUpFormFieldIsInvalid(expectedFieldError);
                await logInSignUpPage.verifyStillOnPage();
            } else if (screen === 2) {
                await signUpInformationPage.fillInformationForm(signupData);
                await signUpInformationPage.submitInformationForm();
                await trackUserForCleanup({email: email, password: password});
                await signUpInformationPage.verifyFormFieldIsInvalid(expectedFieldError);
                await signUpInformationPage.verifyStillOnPage();
                await trackUserForCleanup({email: null, password: null});
            }
        });
    }
});

test.describe("Registration flow with existing email", () => {
    const accInfo = getRequiredField(invalidRegisterData_duplicateEmail, "data");
    const email = getRequiredField(accInfo, "email");
    const password = getRequiredField(accInfo, "password");
    const name = getRequiredField(accInfo, "name");
    test.beforeEach(async ({ authService, trackUserForCleanup }) => {
        console.log(`[Before each hook] Creating test user: ${email}`);
        const response = await authService.createAccount(accInfo);
        BaseValidator.validateFieldValue(response, "responseCode", 201);
        // Register for cleanup
        await trackUserForCleanup({
            email: email,
            password: password,
        });
        console.log(`[Setup] Created test user with email: ${email} for duplicate email registration test.`);
    })
    test("Should display error message when email is existing", async ({ page }) => {
        const errorMessage = getRequiredField(invalidRegisterData_duplicateEmail, "errorMessage");

        const logInSignUpPage = new LogInPage(page);

        console.log(`Testing registration API with duplicate email: ${email}`);
        await logInSignUpPage.navigateTo("signup");
        await logInSignUpPage.signup(name, email);
        await logInSignUpPage.verifyErrorMessage("signup", errorMessage);
        await logInSignUpPage.verifyStillOnPage();
    })
});

test.describe.only("Registration flow with invalid form data", () => {
    for (const testCase of invalidRegisterData_invalidFormatField) {
        test(`Should display validation when "${testCase.name}"`, async ({ page, trackUserForCleanup }) => {
            const screen = getRequiredField(testCase, "screen");
            const expectedFieldError = getRequiredField(testCase, "expectedFieldError");
            const data = getRequiredField(testCase, "data");
            const errorMessage = testCase.errorMessage;

            const logInSignUpPage = new LogInPage(page);
            const signUpInformationPage = new SignUpInformationPage(page);

            const signupData = data;
            const email = signupData.email ?? "";
            const password = signupData.password ?? "";
            await logInSignUpPage.navigateTo("signup");
            await logInSignUpPage.signup(signupData.name ?? "", email);
            if (screen === 1) {
                if (errorMessage) {
                    await logInSignUpPage.verifyErrorMessage("signup", errorMessage);
                } else {
                    await logInSignUpPage.verifySignUpFormFieldIsInvalid(expectedFieldError);
                }
                await logInSignUpPage.verifyStillOnPage();
            } else if (screen === 2) {
                await signUpInformationPage.fillInformationForm(signupData);
                await signUpInformationPage.submitInformationForm();
                await trackUserForCleanup({email: email, password: password});
                await signUpInformationPage.verifyErrorMessage(expectedFieldError, errorMessage);
                await signUpInformationPage.verifyStillOnPage();
                await trackUserForCleanup({email: null, password: null});
            }
        })
    }
})