import { BaseComponent } from "@core/ui/BaseComponent";
import { BaseVerification, VerificationOptions } from "@core/ui/BaseVerification";
import { Page } from "@playwright/test";
import { step } from "@utils/logger";


export class CheckoutModal extends BaseComponent {
    constructor(page: Page) {
        super(page);
    }

    /* ** SELECTORS ** */
    private readonly checkoutModal = this.page.locator('div[id="checkoutModal"]');
    private readonly checkoutModalContent = {
        headerText: this.checkoutModal.locator('div[class="modal-header"] h4'),
        bodyText: this.checkoutModal.locator('div[class="modal-body"] p').first(),
        registerLoginButton: this.checkoutModal.getByRole('link', { name: 'Register / Login' }),
        continueOnCartButton: this.checkoutModal.getByRole('button', { name: 'Continue On Cart' })
    }

    /* ** CONSTANTS ** */
    public readonly HEADER_TEXT = "Checkout";
    public readonly BODY_TEXT = "Register / Login account to proceed on checkout.";

    /* ** ACTION METHODS ** */
    @step("Clicking the 'Register / Login' button from the checkout modal")
    async clickRegisterLogin() {
        await this.checkoutModalContent.registerLoginButton.click();
        await this.waitForReady()
    }
    
    @step("Clicking the 'Continue On Cart' button from the checkout modal")
    async clickContinueOnCart() {
        await this.checkoutModalContent.continueOnCartButton.click();
    }

    /* ** VERIFICATION METHODS ** */
    @step("Verifying the checkout modal header text")
    async verifycheckoutModalIsVisible(options: VerificationOptions = {}) {
        await BaseVerification.verifyElementIsVisible(this.checkoutModal, options);
        await BaseVerification.verifyText(this.checkoutModalContent.headerText, this.HEADER_TEXT, options);
        await BaseVerification.verifyText(this.checkoutModalContent.bodyText, this.BODY_TEXT, options);
        await BaseVerification.verifyElementIsVisible(this.checkoutModalContent.registerLoginButton, options);
        await BaseVerification.verifyElementIsVisible(this.checkoutModalContent.continueOnCartButton, options);
    }

    @step("Verifying the checkout modal is not visible")
    async verifycheckoutModalIsHidden(options: VerificationOptions = {}) {
        await BaseVerification.verifyElementIsHidden(this.checkoutModal, options);
    }
}