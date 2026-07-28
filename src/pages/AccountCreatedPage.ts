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
        await BaseVerification.verifyText(this.textLocators.header, this.HEADER, options);
        for (let i = 0; i < this.MESSAGES.length; i++) {
            await BaseVerification.verifyText(this.textLocators.messages.nth(i), this.MESSAGES[i], options);
        }
    }
}