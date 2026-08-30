import { BasePage } from "@core/ui/BasePage";
import { BaseVerification, VerificationOptions } from "@core/ui/BaseVerification";
import { Page } from "@playwright/test";
import { step } from "@utils/logger";


export class AccountCreatedPage extends BasePage {
    constructor(protected page: Page) {
        super(page);
    }
    
    /* ** SELECTORS ** */
    private readonly container = this.page.locator("section[id='form']");
    private readonly textLocators = {
        header: this.container.getByTestId("account-created"),
        messages: this.container.locator("p"),
    }
    private readonly continueButton = this.container.getByTestId("continue-button");

    /* ** CONSTANTS ** */
    public readonly PAGE_URL = "/account-created";
    public readonly PAGE_TITLE = "Automation Exercise - Account Created";
    public readonly HEADER = "Account Created!";
    public readonly MESSAGES = [
        "Congratulations! Your new account has been successfully created!",
        "You can now take advantage of member privileges to enhance your online shopping experience with us."
    ];

    /* ** ACTION METHODS ** */
    @step("Clicking the Continue button on the Account Created page")
    async clickContinue() {
        await this.continueButton.click();
    }

    /*** VERIFICATION METHODS ***/
    @step("Verifying the content of the Account Created page with expected header and messages")
    async verifyPageContent(options: VerificationOptions = {}) {
        for (let i = 0; i < this.MESSAGES.length; i++) {
            await BaseVerification.verifyText(this.textLocators.messages.nth(i), this.MESSAGES[i], options);
        }
    }

    @step("Verifying the current page is the Account Created page with expected URL, title, and header")
    async verifyCurrentPage(options: VerificationOptions = {}) {
        const expectedUrlRegex = new RegExp(`${this.PAGE_URL}$`);
        await BaseVerification.verifyCurrentUrl(this.page, expectedUrlRegex, options);
        await BaseVerification.verifyPageTitle(this.page, this.PAGE_TITLE, options);
        await BaseVerification.verifyText(this.textLocators.header, this.HEADER, options);
    }
}