import { CheckoutModal } from "@components/CheckoutModal";
import { BasePage } from "@core/ui/BasePage";
import { BaseVerification, VerificationOptions } from "@core/ui/BaseVerification";
import { Locator, Page } from "@playwright/test";
import { step } from "@utils/logger";

export class CheckoutPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    /* ** SELECTORS ** */
    private readonly proceedToCheckoutButton = this.page.locator("a[class*='check_out']");
    private readonly container = {
        cartInfo: this.page.locator("#cart_info"),
        checkoutInfo: this.page.getByTestId("checkout-info"),
    }
    private readonly heading = this.page.locator('h2[class="heading"]');
    private readonly breadcrumb = this.page.locator('ol[class="breadcrumb"] li[class="active"]');

    /* ** CONSTANTS ** */
    public readonly PAGE_URL = "/checkout";
    public readonly PAGE_TITLE = "Automation Exercise - Checkout";
    public readonly PAGE_BREADCRUMB = "Checkout";
    public readonly HEADING_TEXT = {
        address: "Address Details",
        review: "Review Your Order",
    };


    /* ** ACTION METHODS ** */
    

    /* ** VERIFICATION METHODS ** */
    @step("Verify current page is cart page and empty state should be {0}")
    async verifyCurrentPage(isEmpty: boolean = false, options: VerificationOptions = {}) {
        const expectedUrl = new RegExp(`${this.PAGE_URL}$`);
        await BaseVerification.verifyCurrentUrl(this.page, expectedUrl, options);
        await BaseVerification.verifyPageTitle(this.page, this.PAGE_TITLE, options);
        await this.header.verifyItemIsSelected("cart", options);
        await BaseVerification.verifyText(this.breadcrumb, this.PAGE_BREADCRUMB, options);
        await BaseVerification.verifyText(this.heading.nth(0), this.HEADING_TEXT.address, options);
        await BaseVerification.verifyElementIsVisible(this.container.checkoutInfo, options);
        await BaseVerification.verifyText(this.heading.nth(1), this.HEADING_TEXT.review, options);
        await BaseVerification.verifyElementIsVisible(this.container.cartInfo, options);
    }
}