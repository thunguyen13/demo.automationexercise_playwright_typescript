import { BasePage } from "@core/ui/BasePage";
import { BaseVerification, VerificationOptions } from "@core/ui/BaseVerification";
import { Page } from "@playwright/test";
import { step } from "@utils/logger";


export class LogInPage extends BasePage {
    constructor(protected page: Page) {
        super(page);
    }

    /* ** SELECTORS ** */
    private readonly formContainer = this.page.locator("section[id='form']");
    private readonly logInForm = {
        header: this.formContainer.locator("div[class='login-form'] h2"),
        emailField: this.formContainer.getByTestId("login-email"),
        passwordField: this.formContainer.getByTestId("login-password"),
        submitButton: this.formContainer.getByTestId("login-button"),
        errorMessage: this.formContainer.locator("div[class='login-form'] p"),
    }
    private readonly signUpForm = {
        header: this.formContainer.locator("div[class='signup-form'] h2"),
        nameField: this.formContainer.getByTestId("signup-name"),
        emailField: this.formContainer.getByTestId("signup-email"),
        submitButton: this.formContainer.getByTestId("signup-button"),
        errorMessage: this.formContainer.locator("div[class='signup-form'] p"),
    }

    /* ** CONSTANTS ** */
    public readonly LOGIN_URL = "/login";
    public readonly SIGNUP_URL = "/signup";
    public readonly PAGE_TITLE = "Automation Exercise - Signup / Login";
    public readonly LOGIN_FORM_HEADER_TEXT = "Login to your account";
    public readonly SIGNUP_FORM_HEADER_TEXT = "New User Signup!";

    /* ** ACTION METHODS ** */
    @step("Navigate to '{0}' page")
    async navigateTo(pageType: "login" | "signup" = "login") {
        if (pageType === "login")
            await this.page.goto(this.LOGIN_URL);
        else await this.page.goto(this.SIGNUP_URL);
    }

    @step("Log in with email: '{0}' and password: '{1}'")
    async login(email: string, password: string) {
        await this.logInForm.emailField.fill(email);
        await this.logInForm.passwordField.fill(password);
        await this.logInForm.submitButton.click();
    }

    @step("Sign up with name: '{0}' and email: '{1}'")
    async signup(name: string, email: string) {
        await this.signUpForm.nameField.fill(name);
        await this.signUpForm.emailField.fill(email);
        await this.signUpForm.submitButton.click();
    }

    /*** VERIFICATION METHODS ***/
    @step("Verify '{0}' form header is displayed correctly")
    async verifyFormHeader(form: "login" | "signup", options: VerificationOptions = {}) {
        const headerLocator = form === "login" ? this.logInForm.header : this.signUpForm.header;
        const headerText = form === "login" ? this.LOGIN_FORM_HEADER_TEXT : this.SIGNUP_FORM_HEADER_TEXT;
        await BaseVerification.verifyText(headerLocator, headerText, options);
    }

    @step("Verify error message for '{0}' form is displayed correctly")
    async verifyErrorMessage(form: "login" | "signup", expectedMessage: string, options: VerificationOptions = {}) {
        const errorMessageLocator = form === "login" ? this.logInForm.errorMessage : this.signUpForm.errorMessage;
        await BaseVerification.verifyText(errorMessageLocator, expectedMessage, options);
    }

    @step("Verify still on 'Login' or 'Signup' page")
    async verifyStillOnPage(options: VerificationOptions = {}) {
        const expectedUrlRegex = new RegExp(`${this.LOGIN_URL}$|${this.SIGNUP_URL}$`);
        await BaseVerification.verifyCurrentUrl(this.page, expectedUrlRegex, options);
        await BaseVerification.verifyPageTitle(this.page, this.PAGE_TITLE, options);
        await this.verifyFormHeader("login", options);
        await this.verifyFormHeader("signup", options);    
    }

    @step("Verify '{0}' field validation for log in form is displayed correctly")
    async verifyLoginFormFieldIsInvalid(field: string, options: VerificationOptions = {}) {
        const loginRequiredFieldMap = {
            email: this.logInForm.emailField,
            password: this.logInForm.passwordField,
        };
        if (!(field in loginRequiredFieldMap)) {
            throw new Error(`Invalid field name: ${field}. Valid options are: ${Object.keys(loginRequiredFieldMap).join(", ")}.`);
        }
        const fieldLocator = loginRequiredFieldMap[`${field}` as keyof typeof loginRequiredFieldMap];
        await BaseVerification.verifyFieldIsInvalid(fieldLocator, options);
    }

    @step("Verify '{0}' field validation for sign up form is displayed correctly")
    async verifySignUpFormFieldIsInvalid(field: string, options: VerificationOptions = {}) {
        const signupRequiredFieldMap = {
            name: this.signUpForm.nameField,
            email: this.signUpForm.emailField,
        };
        if (!(field in signupRequiredFieldMap)) {
            throw new Error(`Invalid field name: ${field}. Valid options are: ${Object.keys(signupRequiredFieldMap).join(", ")}.`);
        }
        const fieldLocator = signupRequiredFieldMap[`${field}` as keyof typeof signupRequiredFieldMap];
        await BaseVerification.verifyFieldIsInvalid(fieldLocator, options);
    }        
}