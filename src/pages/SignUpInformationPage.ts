import { expect, Locator, Page } from "@playwright/test";
import { BasePage } from "@core/ui/BasePage";
import { BaseVerification, VerificationOptions } from "@core/ui/BaseVerification";
import { step } from "@utils/logger";
import { UserInfo } from "@services/AuthService";

// export interface AccountInformation {
//     title: string; //"Mr" | "Mrs";
//     name: string;
//     email: string;
//     password: string;
//     birth_date: string;
//     birth_month: string;
//     birth_year: string;
//     newsLetter?: boolean;
//     offers?: boolean;
//     firstName: string;
//     lastName: string;
//     company: string;
//     address: string;
//     address2: string;
//     country: string | number;
//     state: string;
//     city: string;
//     zipCode: string;
//     mobileNumber: string;
// }

export const requiredFields = ["email", "name", "password", "firstname", "lastname", "address1", "country", "state", "city", "zipcode", "mobile_number"] as const satisfies readonly (keyof UserInfo)[];
type RequiredFields = typeof requiredFields[number];
export const autoFilledFields = ["name", "email"] as const satisfies readonly (keyof UserInfo)[];
type AutoFilledFields = typeof autoFilledFields[number];
export const errorFields = ["email", "password","zipcode", "mobile_number"] as const satisfies readonly (keyof UserInfo)[];
type ErrorFields = typeof errorFields[number];

export class SignUpInformationPage extends BasePage {
    constructor(protected page: Page) {
        super(page);
    }

    /* ** SELECTORS ** */
    private readonly formContainer = this.page.locator("section[id='form']");
    private readonly informationForm = {
        headers: this.formContainer.locator("h2[class='title text-center']"),
        titleOptions: (title: "Mr" | "Mrs") => this.formContainer.locator(`input[name='title'][value='${title}']`),
        nameField: this.formContainer.getByTestId("name"),
        emailField: this.formContainer.getByTestId("email"),
        passwordField: this.formContainer.getByTestId("password"),
        dayOfBirthDropdown: this.formContainer.getByTestId("days"),
        monthOfBirthDropdown: this.formContainer.getByTestId("months"),
        yearOfBirthDropdown: this.formContainer.getByTestId("years"),
        newsLetterCheckbox: this.formContainer.locator("input[id='newsletter']"),
        offersCheckbox: this.formContainer.locator("input[id='optin']"),
        firstNameField: this.formContainer.getByTestId("first_name"),
        lastNameField: this.formContainer.getByTestId("last_name"),
        companyField: this.formContainer.getByTestId("company"),
        address1Field: this.formContainer.getByTestId("address"),
        address2Field: this.formContainer.getByTestId("address2"),
        countryDropdown: this.formContainer.getByTestId("country"),
        stateField: this.formContainer.getByTestId("state"),
        cityField: this.formContainer.getByTestId("city"),
        zipCodeField: this.formContainer.getByTestId("zipcode"),
        mobileNumberField: this.formContainer.getByTestId("mobile_number"),
        createAccountButton: this.formContainer.getByTestId("create-account"),
    }
    private readonly errorMessages: Record<ErrorFields, Locator> = {
        email: this.informationForm.emailField.locator("xpath=following-sibling::p"),
        mobile_number: this.informationForm.mobileNumberField.locator("xpath=following-sibling::p"),
        zipcode: this.informationForm.zipCodeField.locator("xpath=following-sibling::p"),
        password: this.informationForm.passwordField.locator("xpath=following-sibling::p"),
    }

    /* ** CONSTANTS ** */
    public readonly URL = "/signup";
    public readonly PAGE_TITLE = "Automation Exercise - Signup";
    public readonly HEADER_TEXT = {
        ACCOUNT_INFORMATION: "Enter Account Information",
        ADDRESS_INFORMATION: "Address Information",
    }

    /* ** ACTION METHODS ** */
    @step("Fill information form with: {0}")
    async fillInformationForm(accountInfo: Partial<UserInfo>) {
        if (accountInfo.title !== undefined) {
            if (accountInfo.title !== "Mr" && accountInfo.title !== "Mrs") {
                console.warn("Title must be 'Mr' or 'Mrs'");
            } else {
                await this.informationForm.titleOptions(accountInfo.title).check();
            }
        }
        if (accountInfo.name !== undefined)
            await this.informationForm.nameField.fill(accountInfo.name);
        if (accountInfo.password !== undefined)
            await this.informationForm.passwordField.fill(accountInfo.password);
        if (accountInfo.birth_date !== undefined)
            await this.informationForm.dayOfBirthDropdown.selectOption(accountInfo.birth_date);
        if (accountInfo.birth_month !== undefined)
            await this.informationForm.monthOfBirthDropdown.selectOption(accountInfo.birth_month);
        if (accountInfo.birth_year !== undefined)
            await this.informationForm.yearOfBirthDropdown.selectOption(accountInfo.birth_year);
        if (accountInfo.newsLetter !== undefined)
            await this.informationForm.newsLetterCheckbox.setChecked(accountInfo.newsLetter);
        if (accountInfo.offers !== undefined)
            await this.informationForm.offersCheckbox.setChecked(accountInfo.offers || false);
        if (accountInfo.firstname !== undefined)
            await this.informationForm.firstNameField.fill(accountInfo.firstname);
        if (accountInfo.lastname !== undefined)
            await this.informationForm.lastNameField.fill(accountInfo.lastname);
        if (accountInfo.company !== undefined)
            await this.informationForm.companyField.fill(accountInfo.company);
        if (accountInfo.address1 !== undefined)
            await this.informationForm.address1Field.fill(accountInfo.address1);
        if (accountInfo.address2 !== undefined)
            await this.informationForm.address2Field.fill(accountInfo.address2);
        if (accountInfo.country !== undefined) {
            const countryOptions = ["India", "United States", "Canada", "Australia", "Israel", "New Zealand", "Singapore"];
            let counttyOption;
            if (typeof accountInfo.country === "number") {
                if (accountInfo.country < 0 || accountInfo.country >= countryOptions.length) {
                    throw new Error(`Invalid country index: ${accountInfo.country}. Valid range is 0 to ${countryOptions.length - 1}.`);
                }
                counttyOption = countryOptions[accountInfo.country];
            } else {
                if (!countryOptions.includes(accountInfo.country)) {
                    throw new Error(`Invalid country name: ${accountInfo.country}. Valid options are: ${countryOptions.join(", ")}.`);
                }
                counttyOption = accountInfo.country;
            }
            await this.informationForm.countryDropdown.selectOption(counttyOption);
        }
        if (accountInfo.state !== undefined)
            await this.informationForm.stateField.fill(accountInfo.state);
        if (accountInfo.city !== undefined)
            await this.informationForm.cityField.fill(accountInfo.city);
        if (accountInfo.zipcode !== undefined)
            await this.informationForm.zipCodeField.fill(accountInfo.zipcode);
        if (accountInfo.mobile_number !== undefined)
            await this.informationForm.mobileNumberField.fill(accountInfo.mobile_number);
    }

    @step("Submit information form")
    async submitInformationForm() {
        await this.informationForm.createAccountButton.click();
    }

    /* ** VERIFICATION METHODS ** */
    @step("Verify '{0}' form header is displayed correctly")
    async verifyFormHeader(form: "account" | "address", options: VerificationOptions = {}) {
        const headerLocator = form === "account" ? this.informationForm.headers.first() : this.informationForm.headers.nth(1);
        const headerText = form === "account" ? this.HEADER_TEXT.ACCOUNT_INFORMATION : this.HEADER_TEXT.ADDRESS_INFORMATION;
        await BaseVerification.verifyText(headerLocator, headerText, options);
    }

    @step("Verify still on information form page")
    async verifyStillOnPage(options: VerificationOptions = {}) {
        const expectedUrlRegex = new RegExp(`${this.URL}$`);
        await BaseVerification.verifyCurrentUrl(this.page, expectedUrlRegex, options);
        await BaseVerification.verifyPageTitle(this.page, this.PAGE_TITLE, options);
        await this.verifyFormHeader("account", options);
        await this.verifyFormHeader("address", options);
    }

    @step("Verify '{0}' field validation is displayed")
    async verifyFormFieldIsInvalid(fieldName: string, options: VerificationOptions = {}) {
        const requiredFieldMap: Record<RequiredFields, Locator> = {
            name: this.informationForm.nameField,
            email: this.informationForm.emailField,
            password: this.informationForm.passwordField,
            firstname: this.informationForm.firstNameField,
            lastname: this.informationForm.lastNameField,
            address1: this.informationForm.address1Field,
            country: this.informationForm.countryDropdown,
            state: this.informationForm.stateField,
            city: this.informationForm.cityField,
            zipcode: this.informationForm.zipCodeField,
            mobile_number: this.informationForm.mobileNumberField,
        };
        if (!(fieldName in requiredFieldMap)) {
            throw new Error(`Invalid field name: ${fieldName}. Valid options are: ${Object.keys(requiredFieldMap).join(", ")}.`);
        }
        const fieldLocator = requiredFieldMap[fieldName as RequiredFields];
        await BaseVerification.verifyFieldIsInvalid(fieldLocator, options);
    }

    @step("Verify '{0}' field is auto-filled with expected value '{1}'")
    async verifyAutoFilledData(field: string, expectedValue: string, options: VerificationOptions = {}) {
        const autoFilledFieldMap: Record<AutoFilledFields, Locator> = {
            name: this.informationForm.nameField,
            email: this.informationForm.emailField,
        };
        if (!(field in autoFilledFieldMap)) {
            throw new Error(`Invalid field name: ${field}. Valid options are: ${Object.keys(autoFilledFieldMap).join(", ")}.`);
        }
        const fieldLocator = autoFilledFieldMap[field as AutoFilledFields];
        await BaseVerification.verifyFieldValue(fieldLocator, expectedValue, options);
    }

    @step("Verify email field is disabled")
    async verifyDisabledEmailField(options: VerificationOptions = {}) {
        const expectFn = BaseVerification.getExpect(options.soft);
        const errorMsg = "Expected email field to be disabled";
        await BaseVerification.expectWithLog(
            async () => await expectFn(this.informationForm.emailField, errorMsg).toBeDisabled({ timeout: options.timeout }), 
            errorMsg
        );
    }

    async verifyErrorMessage(fieldName: string, expectedMessage: string, options: VerificationOptions = {}) {
        if (!(fieldName in this.errorMessages)) {
            throw new Error(`Invalid field name: ${fieldName}. Valid options are: ${Object.keys(this.errorMessages).join(", ")}.`);
        }
        const fieldLocator = this.errorMessages[fieldName as ErrorFields];
        await BaseVerification.verifyText(fieldLocator, expectedMessage, options);
    }
}