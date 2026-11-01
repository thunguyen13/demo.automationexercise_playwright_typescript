import { LogInSignUpPage } from "@pages/LogInSignUpPage";
import { SignUpInformationPage } from "@pages/SignUpInformationPage";
import { test } from "@fixtures/ui/common";
import { invalidRegisterData_duplicateEmail, invalidRegisterData_invalidFormatField, invalidRegisterData_missingFieldData, validAccInfo } from "@data/ui/account";
import { AccountCreatedPage } from "@pages/AccountCreatedPage";
import { getRequiredField } from "@utils/helpers";
import { HomePage } from "@pages/HomePage";

const validEmail = getRequiredField(validAccInfo, "email");
const validPassword = getRequiredField(validAccInfo, "password");
const validName = getRequiredField(validAccInfo, "name");

test.describe.configure({ mode: "parallel" });

test.describe("Registration flow with valid data", () => {
    test("Should register successfully and navigate to account created page", async ({ page, trackUserForCleanup }) => {
        console.log(`[TEST] Registering user: ${validEmail}`);

        const logInSignUpPage = new LogInSignUpPage(page);
        const signUpInformationPage = new SignUpInformationPage(page);
        const accountCreatedPage = new AccountCreatedPage(page);
        const homePage = new HomePage(page);

        await logInSignUpPage.navigateTo("signup");
        await logInSignUpPage.signup(validName, validEmail);
        await signUpInformationPage.fillInformationForm(validAccInfo);
        await signUpInformationPage.submitInformationForm();
        trackUserForCleanup({ email: validEmail, password: validPassword });
        await accountCreatedPage.verifyCurrentPage();
        await accountCreatedPage.verifyPageContent();
        await accountCreatedPage.clickContinue();
        await homePage.header.verifyLoggedInAsText(`${validName}`);
    });
});

test.describe("Account information form auto-filling and disabling", () => {
    test("Should auto-filled name field in information form based on name provided in signup form", async ({ page }) => {
        console.log(`[TEST] Verifying auto-filled name field in information form for user: ${validEmail}`);

        const logInSignUpPage = new LogInSignUpPage(page);
        const signUpInformationPage = new SignUpInformationPage(page);

        await logInSignUpPage.navigateTo("signup");
        await logInSignUpPage.signup(validName, validEmail);
        await signUpInformationPage.verifyAutoFilledData("name", validName);
    });
    test("Should auto-filled and disabled email field in information form based on email provided in signup form", async ({ page }) => {
        console.log(`[TEST] Verifying auto-filled and disabled email field in information form for user: ${validEmail}`);
        const logInSignUpPage = new LogInSignUpPage(page);
        const signUpInformationPage = new SignUpInformationPage(page);

        await logInSignUpPage.navigateTo("signup");
        await logInSignUpPage.signup(validName, validEmail);
        await signUpInformationPage.verifyAutoFilledData("email", validEmail);
        await signUpInformationPage.verifyDisabledEmailField();
    });
});

test.describe("Registration flow with empty required fields", () => {
    for (const testCase of invalidRegisterData_missingFieldData) {
        test(`Should display validation when "${testCase.name}"`, async ({ page, trackUserForCleanup }) => {
            console.log(`[TEST] Case: ${testCase.name}`);

            const screen = getRequiredField(testCase, "screen");
            const expectedFieldError = getRequiredField(testCase, "expectedFieldError");
            const signupData = getRequiredField(testCase, "data");

            const logInSignUpPage = new LogInSignUpPage(page);
            const signUpInformationPage = new SignUpInformationPage(page);
            
            const name = signupData.name ?? "";
            const email = signupData.email ?? "";
            const password = signupData.password ?? "";
            await logInSignUpPage.navigateTo("signup");
            await logInSignUpPage.signup(name, email);
            if (screen === 1) {
                await logInSignUpPage.verifySignUpFormFieldIsInvalid(expectedFieldError);
                await logInSignUpPage.verifyCurrentPage();
            } else if (screen === 2) {
                await signUpInformationPage.fillInformationForm(signupData);
                await signUpInformationPage.submitInformationForm();
                trackUserForCleanup({email: email, password: password});
                await signUpInformationPage.verifyFormFieldIsInvalid(expectedFieldError);
                await signUpInformationPage.verifyCurrentPage();
                trackUserForCleanup({email: null, password: null});
            }
        });
    }
});

test.describe("Registration flow with existing email", () => {
    test("Should display error message when email is existing", async ({ page, createdUser }) => {
        console.log(`[TEST] Registering user with existing email: ${createdUser.email}`);

        const name = getRequiredField(createdUser, "name");
        const email = getRequiredField(createdUser, "email");

        const errorMessage = getRequiredField(invalidRegisterData_duplicateEmail, "errorMessage");

        const logInSignUpPage = new LogInSignUpPage(page);

        await logInSignUpPage.navigateTo("signup");
        await logInSignUpPage.signup(name, email);
        await logInSignUpPage.verifyErrorMessage("signup", errorMessage);
        await logInSignUpPage.verifyCurrentPage();
    })
});

test.describe("Registration flow with invalid form data", () => {
    for (const testCase of invalidRegisterData_invalidFormatField) {
        test(`Should display validation when "${testCase.name}"`, async ({ page, trackUserForCleanup }) => {
            console.log(`[TEST] Case: ${testCase.name}`);
            
            const screen = getRequiredField(testCase, "screen");
            const expectedFieldError = getRequiredField(testCase, "expectedFieldError");
            const data = getRequiredField(testCase, "data");
            const errorMessage = testCase.errorMessage;

            const logInSignUpPage = new LogInSignUpPage(page);
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
                await logInSignUpPage.verifyCurrentPage();
            } else if (screen === 2) {
                await signUpInformationPage.fillInformationForm(signupData);
                await signUpInformationPage.submitInformationForm();
                trackUserForCleanup({email: email, password: password});
                await signUpInformationPage.verifyErrorMessage(expectedFieldError, errorMessage);
                await signUpInformationPage.verifyCurrentPage();
                trackUserForCleanup({email: null, password: null});
            }
        })
    }
})