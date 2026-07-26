import { LogInPage } from "@pages/LogInSignUpPage";
import { SignUpInformationPage } from "@pages/SignUpInformationPage";
import { test } from "@fixtures/ui/auth";
import { invalidRegisterData_duplicateEmail, invalidRegisterData_invalidFormatField, invalidRegisterData_misingFieldData, validAccInfo } from "@data/ui/accountData";
import { AccountCreatedPage } from "@pages/AccountCreatedPage";
import { BaseValidator } from "@core/api/BaseValidator";

test.describe("Registration flow with valid data", () => {
    test("Should register successfully and navigate to account created page", async ({ page, trackUserForCleanup }) => {
        const logInSignUpPage = new LogInPage(page);
        const signUpInformationPage = new SignUpInformationPage(page);
        const accountCreatedPage = new AccountCreatedPage(page);

        await logInSignUpPage.navigateTo("signup");
        await logInSignUpPage.signup(validAccInfo.name, validAccInfo.email);
        await signUpInformationPage.fillInformationForm(validAccInfo);
        await signUpInformationPage.submitInformationForm();
        await trackUserForCleanup({ email: validAccInfo.email, password: validAccInfo.password });
        await accountCreatedPage.verifyPageContent();
    });
});

test.describe("Account information form auto-filling and disabling", () => {
    test("Should auto-filled name field in information form based on name provided in signup form", async ({ page }) => {
        const logInSignUpPage = new LogInPage(page);
        const signUpInformationPage = new SignUpInformationPage(page);

        await logInSignUpPage.navigateTo("signup");
        await logInSignUpPage.signup(validAccInfo.name, validAccInfo.email);
        await signUpInformationPage.verifyAutoFilledData("name", validAccInfo.name);
    });
    test("Should auto-filled and disabled email field in information form based on email provided in signup form", async ({ page }) => {
        const logInSignUpPage = new LogInPage(page);
        const signUpInformationPage = new SignUpInformationPage(page);

        await logInSignUpPage.navigateTo("signup");
        await logInSignUpPage.signup(validAccInfo.name, validAccInfo.email);
        await signUpInformationPage.verifyAutoFilledData("email", validAccInfo.email);
        await signUpInformationPage.verifyDisabledEmailField();
    });
});

test.describe("Registration flow with empty required fields", () => {
    for (const testCase of invalidRegisterData_misingFieldData) {
        test(`Should display validation when "${testCase.name}"`, async ({ page, trackUserForCleanup }) => {
            const logInSignUpPage = new LogInPage(page);
            const signUpInformationPage = new SignUpInformationPage(page);
            
            const signupData = testCase.data;
            const email = signupData.email ?? "";
            const password = signupData.password ?? "";
            await logInSignUpPage.navigateTo("signup");
            await logInSignUpPage.signup(signupData.name ?? "", email);
            if (testCase.screen === 1 && testCase.expectedFieldError) {
                await logInSignUpPage.verifySignUpFormFieldIsInvalid(testCase.expectedFieldError);
                await logInSignUpPage.verifyStillOnPage();
            } else if (testCase.screen === 2 && testCase.expectedFieldError) {
                await signUpInformationPage.fillInformationForm(signupData);
                await signUpInformationPage.submitInformationForm();
                await trackUserForCleanup({email: email, password: password});
                await signUpInformationPage.verifyFormFieldIsInvalid(testCase.expectedFieldError);
                await signUpInformationPage.verifyStillOnPage();
                await trackUserForCleanup({email: null, password: null});
            }
        });
    }
});

test.describe("Registration flow with existing email", () => {
    const accInfo = invalidRegisterData_duplicateEmail.data;
    test.beforeEach(async ({ authService, trackUserForCleanup }) => {
        console.log(`[Before each hook] Creating test user: ${accInfo.email}`);
        const response = await authService.createAccount(accInfo);
        BaseValidator.validateFieldValue(response, "responseCode", 201);
        // Register for cleanup
        await trackUserForCleanup({
            email: accInfo.email!,
            password: accInfo.password!,
        });
        console.log(`[Setup] Created test user with email: ${accInfo.email} for duplicate email registration test.`);
    })
    test("Should display error message when email is existing", async ({ page }) => {
        const logInSignUpPage = new LogInPage(page);

        console.log(`Testing registration API with duplicate email: ${accInfo.email}`);
        const email = accInfo.email ?? "";
        const name = accInfo.name ?? "";
        await logInSignUpPage.navigateTo("signup");
        await logInSignUpPage.signup(name, email);
        await logInSignUpPage.verifyErrorMessage("signup", invalidRegisterData_duplicateEmail.errorMessage);
        await logInSignUpPage.verifyStillOnPage();
    })
});

test.describe("Registration flow with invalid form data", () => {
    for (const testCase of invalidRegisterData_invalidFormatField) {
        test(`Should display validation when "${testCase.name}"`, async ({ page, trackUserForCleanup }) => {
            const logInSignUpPage = new LogInPage(page);
            const signUpInformationPage = new SignUpInformationPage(page);

            const signupData = testCase.data;
            const email = signupData.email ?? "";
            const password = signupData.password ?? "";
            await logInSignUpPage.navigateTo("signup");
            await logInSignUpPage.signup(signupData.name ?? "", email);
            await signUpInformationPage.fillInformationForm(signupData);
            await signUpInformationPage.submitInformationForm();
            await trackUserForCleanup({email: email, password: password});
            await signUpInformationPage.verifyErrorMessage(testCase.expectedFieldError, testCase.errorMessage);
            await signUpInformationPage.verifyStillOnPage();
            await trackUserForCleanup({email: null, password: null});
        })
    }
})