import { BaseVerification, VerificationOptions } from "@core/ui/BaseVerification";
import { Page } from "@playwright/test";
import { step } from "@utils/logger";


export class CartModal {
    constructor(private page: Page) {}

    /* ** SELECTORS ** */
    private readonly cartModal = this.page.locator('div[id="cartModal"]');
    private readonly cartModalContent = {
        headerText: this.cartModal.locator('div[class="modal-header"] h4'),
        bodyText: this.cartModal.locator('div[class="modal-body"] p').first(),
        viewCartButton: this.cartModal.getByRole('link', { name: 'View Cart' }),
        continueShoppingButton: this.cartModal.getByRole('button', { name: 'Continue Shopping' })
    }

    /* ** CONSTANTS ** */
    public readonly HEADER_TEXT = "Added!";
    public readonly BODY_TEXT = "Your product has been added to cart.";

    /* ** ACTION METHODS ** */
    @step("Clicking the 'View Cart' button from the cart modal")
    async clickViewCart() {
        await this.cartModalContent.viewCartButton.click();
    }
    
    @step("Clicking the 'Continue Shopping' button from the cart modal")
    async clickContinueShopping() {
        await this.cartModalContent.continueShoppingButton.click();
    }

    /* ** VERIFICATION METHODS ** */
    @step("Verifying the cart modal header text")
    async verifyCartModalIsVisible(options: VerificationOptions = {}) {
        await BaseVerification.verifyElementIsVisible(this.cartModal, options);
        await BaseVerification.verifyText(this.cartModalContent.headerText, this.HEADER_TEXT, options);
        await BaseVerification.verifyText(this.cartModalContent.bodyText, this.BODY_TEXT, options);
        await BaseVerification.verifyElementIsVisible(this.cartModalContent.viewCartButton, options);
        await BaseVerification.verifyElementIsVisible(this.cartModalContent.continueShoppingButton, options);
    }

    @step("Verifying the cart modal is not visible")
    async verifyCartModalIsHidden(options: VerificationOptions = {}) {
        await BaseVerification.verifyElementIsHidden(this.cartModal, options);
    }
}