import { CartProduct, CartTable } from "@components/CartTable";
import { CheckoutModal } from "@components/CheckoutModal";
import { BasePage } from "@core/ui/BasePage";
import { BaseVerification, VerificationOptions } from "@core/ui/BaseVerification";
import { Locator, Page } from "@playwright/test";
import { step } from "@utils/logger";

export class CartPage extends BasePage {
    public readonly checkoutModal: CheckoutModal;
    public readonly cartTable: CartTable;
    constructor(page: Page) {
        super(page);
        this.checkoutModal = new CheckoutModal(this.page);
        this.cartTable = new CartTable(this.page, this.container);
    }

    /* ** SELECTORS ** */
    private readonly proceedToCheckoutButton = this.page.locator("a[class*='check_out']");
    private readonly container = this.page.locator("#cart_info");
    private readonly empty = {
        message: this.container.locator('span[id="empty_cart"]'),
        hereButton: this.container.getByRole('link', { name: 'here' }),
    }
    
    private readonly breadcrumb = this.page.locator('ol[class="breadcrumb"] li[class="active"]');

    /* ** CONSTANTS ** */
    public readonly PAGE_URL = "/view_cart";
    public readonly PAGE_TITLE = "Automation Exercise - Checkout";
    public readonly PAGE_BREADCRUMB = "Shopping Cart";
    public readonly EMPTY_CART_MESSAGE = "Cart is empty! Click here to buy products.";

    /* ** ACTION METHODS ** */
    
    @step("Navigating to cart page")
    async navigateTo() {
        await this.page.goto(this.PAGE_URL);
    }

    @step("Clicking on 'Here' button in empty cart message")
    async clickHereButton() {
        await this.empty.hereButton.click();
    }

    @step("Clicking on 'Proceed To Checkout' button")
    async clickProceedToCheckoutButton() {
        await this.proceedToCheckoutButton.click();
    }

    /* ** VERIFICATION METHODS ** */
    @step("Verify current page is cart page and empty state should be {0}")
    async verifyCurrentPage(isEmpty: boolean = false, options: VerificationOptions = {}) {
        const expectedUrl = new RegExp(`${this.PAGE_URL}$`);
        await BaseVerification.verifyCurrentUrl(this.page, expectedUrl, options);
        await BaseVerification.verifyPageTitle(this.page, this.PAGE_TITLE, options);
        await this.header.verifyItemIsSelected("cart", options);
        await BaseVerification.verifyText(this.breadcrumb, this.PAGE_BREADCRUMB, options);
        if (isEmpty) {
            await this.verifyCartIsEmpty(options);
        } else {
            await this.verifyCartIsNotEmpty(options);
        }
    }

    @step("Verify cart is empty")
    async verifyCartIsEmpty(options: VerificationOptions = {}) {
        await BaseVerification.verifyText(this.empty.message, this.EMPTY_CART_MESSAGE, options);
        await this.cartTable.verifyCartTableIsNotDisplayed(options);
    }

    @step("Verify cart is not empty")
    async verifyCartIsNotEmpty(options: VerificationOptions = {}) {
        await BaseVerification.verifyElementIsHidden(this.empty.message, options);
        await this.cartTable.verifyCartTableIsDisplayed(options);
    }

}