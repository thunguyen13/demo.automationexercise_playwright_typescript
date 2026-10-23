import { CartProduct, CartTable } from "@components/CartTable";
import { CheckoutModal } from "@components/CheckoutModal";
import { BasePage } from "@core/ui/BasePage";
import { BaseVerification, VerificationOptions } from "@core/ui/BaseVerification";
import { Locator, Page } from "@playwright/test";
import { UserInfo } from "@services/AuthService";
import { parsePrice } from "@utils/helpers";
import { step } from "@utils/logger";

type CheckoutAddress = "delivery" | "billing";
export type AddressDetails = 
    Pick<UserInfo, "firstname" | "lastname" | "address1" | "city" | "state" | "zipcode" | "mobile_number">
    & Partial<Pick<UserInfo, "title" | "company" | "address2">>
    & { country: string };

export class CheckoutPage extends BasePage {
    public readonly cartTable: CartTable;
    constructor(page: Page) {
        super(page);
        this.cartTable = new CartTable(this.page, this.container.cartInfo);
    }

    /* ** SELECTORS ** */
    private readonly container = {
        cartInfo: this.page.locator("#cart_info"),
        checkoutInfo: this.page.getByTestId("checkout-info"),
    }
    private readonly addressContainer: Record<CheckoutAddress, Locator> = {
        delivery: this.container.checkoutInfo.locator('#address_delivery'),
        billing: this.container.checkoutInfo.locator('#address_invoice'),
    }
    private readonly info = {
        title: (container: CheckoutAddress) => this.addressContainer[container].locator('h3.page-subheading'),
        name: (container: CheckoutAddress) => this.addressContainer[container].locator('li.address_firstname.address_lastname'),
        company: (container: CheckoutAddress) => this.addressContainer[container].locator('li.address_address1.address_address2').nth(0),
        address1: (container: CheckoutAddress) => this.addressContainer[container].locator('li.address_address1.address_address2').nth(1),
        address2: (container: CheckoutAddress) => this.addressContainer[container].locator('li.address_address1.address_address2').nth(2),
        cityStateZip: (container: CheckoutAddress) => this.addressContainer[container].locator('li.address_city.address_state_name.address_postcode'),
        country: (container: CheckoutAddress) => this.addressContainer[container].locator('li.address_country_name'),
        phone: (container: CheckoutAddress) => this.addressContainer[container].locator('li.address_phone'),
    }
    private readonly totalAmount = this.container.cartInfo.locator('.cart_total_price').last();
    private readonly orderMsgLabel = this.page.locator('#ordermsg label');
    private readonly orderMsgTextArea = this.page.locator('#ordermsg textarea');
    private readonly placeOrderBtn = this.page.getByRole('link', { name: 'Place Order' });
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
    public readonly ORDER_MSG_LABEL = "If you would like to add a comment about your order, please write it in the field below.";

    /* ** ACTION METHODS ** */
    calTotalAmount(products: CartProduct[]) {
        const totalAmount = products.reduce((sum, product) => {
            const parsedPrice = parsePrice(product.price);
            const totalPrice = parsedPrice.value * product.quantity;
            return sum + totalPrice;
        }, 0);
        const currency = products.length > 0 ? parsePrice(products[0].price).currency : "Rs. ";
        return {
            currency, 
            value: totalAmount 
        };
    }

    @step("Add order message: {0}")
    async addOrderMessage(message: string) {
        await this.orderMsgTextArea.fill(message);
    }

    @step("Click place order button")
    async clickPlaceOrder() {
        await this.placeOrderBtn.click();
    }
    
    /* ** VERIFICATION METHODS ** */
    @step("Verify total amount is correct based on products in cart")
    async verifyTotalAmount(products: CartProduct[], options: VerificationOptions = {}) {
        const expectFn = BaseVerification.getExpect(options.soft);
        const expectedTotalAmount = this.calTotalAmount(products);
        const actualTotalAmountText = await this.totalAmount.textContent();
        if (!actualTotalAmountText) {
            throw new Error("Total amount text is not found on the page.");
        }
        const actualTotalAmount = parsePrice(actualTotalAmountText);
        const errMsg = `Expected total amount: ${expectedTotalAmount.currency}${expectedTotalAmount.value}, but got: ${actualTotalAmount.currency}${actualTotalAmount.value}`;
        await BaseVerification.expectWithLog(() => expectFn(actualTotalAmount).toEqual(expectedTotalAmount), errMsg);
    }

    @step("Verify current page is cart page and empty state should be {0}")
    async verifyCurrentPage(options: VerificationOptions = {}) {
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

    @step("Verify address details for {0} address")
    async verifyAddressDetails(container: CheckoutAddress, expectedDetails: AddressDetails, options: VerificationOptions = {}) {
        const expectedTitle = expectedDetails.title ? `${expectedDetails.title}.` : ".";
        const expectedName = `${expectedTitle} ${expectedDetails.firstname} ${expectedDetails.lastname}`;
        await BaseVerification.verifyText(this.info.name(container), expectedName, options);

        if (expectedDetails.company) {
            await BaseVerification.verifyText(this.info.company(container), expectedDetails.company, options);
        }

        await BaseVerification.verifyText(this.info.address1(container), expectedDetails.address1, options);

        if (expectedDetails.address2) {
            await BaseVerification.verifyText(this.info.address2(container), expectedDetails.address2, options);
        }

        const expectedCityStateZip = `${expectedDetails.city} ${expectedDetails.state} ${expectedDetails.zipcode}`;
        await BaseVerification.verifyText(this.info.cityStateZip(container), expectedCityStateZip, options);

        await BaseVerification.verifyText(this.info.country(container), expectedDetails.country, options);

        await BaseVerification.verifyText(this.info.phone(container), expectedDetails.mobile_number, options);
    }

    @step("Verify order message area is displayed")
    async verifyOrderMessageAreaDisplayed(options: VerificationOptions = {}) {
        await BaseVerification.verifyText(this.orderMsgLabel, this.ORDER_MSG_LABEL, options);
        await BaseVerification.verifyElementIsVisible(this.orderMsgTextArea, options);
    }

    @step("Verify order message is correct")
    async verifyOrderMessage(message: string, options: VerificationOptions = {}) {
        const expectFn = BaseVerification.getExpect(options.soft);
        const errMsg = `Expected order message: '${message}', but got: '${await this.orderMsgTextArea.inputValue()}'`;
        await BaseVerification.expectWithLog(() => expectFn(this.orderMsgTextArea).toHaveValue(message), errMsg);
    }
}