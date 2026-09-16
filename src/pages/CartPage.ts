import { BasePage } from "@core/ui/BasePage";
import { BaseVerification, VerificationOptions } from "@core/ui/BaseVerification";
import { Locator, Page } from "@playwright/test";
import { step } from "@utils/logger";

export type CartProduct = {
    name: string;
    category?: string;
    price: string;
    quantity: number;
    imageSrc?: string | null;
}

export class CartPage extends BasePage {
    constructor(protected page: Page) {
        super(page);
    }

    /* ** SELECTORS ** */
    private readonly proceedToCheckoutButton = this.page.getByRole('link', { name: 'Proceed To Checkout' });
    private readonly container = this.page.locator("#cart_info");
    private readonly empty = {
        message: this.container.locator('span[id="empty_cart"]'),
        hereButton: this.container.getByRole('link', { name: 'here' }),
    }
    private readonly cartInfoTable = this.container.locator('table[id="cart_info_table"]');
    private readonly cartInfoTableHeaders = {
        item: this.cartInfoTable.locator('thead td[class="image"]'),
        description: this.cartInfoTable.locator('thead td[class="description"]'),
        quantity: this.cartInfoTable.locator('thead td[class="quantity"]'),
        price: this.cartInfoTable.locator('thead td[class="price"]'),
        total: this.cartInfoTable.locator('thead td[class="total"]'),
        delete: this.cartInfoTable.locator('thead td').last(),
    }
    private readonly cartInfoTableRows = this.cartInfoTable.locator('tbody tr');
    private readonly cartProducts = {
        // item: (row?: Locator) => (row ?? this.cartInfoTableRows).locator('td[class="cart_product"]'),
        // description: (row?: Locator) => (row ?? this.cartInfoTableRows).locator('td[class="cart_description"]'),
        image: (row?: Locator) => (row ?? this.cartInfoTableRows).locator('td[class="cart_product"] img'),
        name: (row?: Locator) => (row ?? this.cartInfoTableRows).locator('td[class="cart_description"] h4 a'),
        category: (row?: Locator) => (row ?? this.cartInfoTableRows).locator('td[class="cart_description"] p'),
        price: (row?: Locator) => (row ?? this.cartInfoTableRows).locator('td[class="cart_price"] p'),
        quantity: (row?: Locator) => (row ?? this.cartInfoTableRows).locator('td[class="cart_quantity"] button'),
        total: (row?: Locator) => (row ?? this.cartInfoTableRows).locator('td[class="cart_total"] p'),
        deleteButton: (row?: Locator) => (row ?? this.cartInfoTableRows).locator('td[class="cart_delete"] a'),
    }
    private readonly breadcrumb = this.page.locator('ol[class="breadcrumb"] li[class="active"]');

    /* ** CONSTANTS ** */
    public readonly PAGE_URL = "/view_cart";
    public readonly PAGE_TITLE = "Automation Exercise - Checkout";
    public readonly PAGE_BREADCRUMB = "Shopping Cart";
    public readonly EMPTY_CART_MESSAGE = "Cart is empty! Click here to buy products.";
    public readonly TABLE_HEADERS = {
        ITEM: "Item",
        DESCRIPTION: "Description",
        PRICE: "Price",
        QUANTITY: "Quantity",
        TOTAL: "Total",
        DELETE: "",
    }


    /* ** ACTION METHODS ** */
    getProductRow(by: {name: string, price?: string, category?: string}) {
        let rows = this.cartInfoTableRows;
        rows = rows.filter({
            hasText: by.name
        })
        if (by.price) {
            rows = rows.filter({
                hasText: by.price
            })
        }
        if (by.category) {
            rows = rows.filter({
                hasText: by.category
            })
        }
        return rows;
    }

    @step("Clicking on 'Here' button in empty cart message")
    async clickHereButton() {
        await this.empty.hereButton.click();
    }

    @step("Clicking on 'Proceed To Checkout' button")
    async clickProceedToCheckoutButton() {
        await this.proceedToCheckoutButton.click();
    }

    @step("Deleting product(s) from cart: {0}")
    async deleteProduct(by: {name: string, price?: string, category?: string}[]) {
        for (const product of by) {
            const rows = this.getProductRow(product);
            if (await rows.count() === 0) {
                throw new Error(`Product not found in cart: ${JSON.stringify(product)}`);
            }
            await this.cartProducts.deleteButton(rows.first()).click(); 
        }
    }

    /* ** VERIFICATION METHODS ** */

    async verifyCurrentPage(isEmpty: boolean = false, options: VerificationOptions = {}) {
        const expectedUrl = new RegExp(`${this.PAGE_URL}$`);
        await BaseVerification.verifyCurrentUrl(this.page, expectedUrl, options);
        await BaseVerification.verifyPageTitle(this.page, this.PAGE_TITLE, options);
        await this.header.verifyItemIsSelected("cart", options);
        await BaseVerification.verifyText(this.breadcrumb, this.PAGE_BREADCRUMB, options);
        if (isEmpty) {
            await BaseVerification.verifyText(this.empty.message, this.EMPTY_CART_MESSAGE, options);
        } else {
            await BaseVerification.verifyElementIsHidden(this.empty.message, options);
            await BaseVerification.verifyText(this.cartInfoTableHeaders.item, this.TABLE_HEADERS.ITEM, options);
            await BaseVerification.verifyText(this.cartInfoTableHeaders.description, this.TABLE_HEADERS.DESCRIPTION, options);
            await BaseVerification.verifyText(this.cartInfoTableHeaders.price, this.TABLE_HEADERS.PRICE, options);
            await BaseVerification.verifyText(this.cartInfoTableHeaders.quantity, this.TABLE_HEADERS.QUANTITY, options);
            await BaseVerification.verifyText(this.cartInfoTableHeaders.total, this.TABLE_HEADERS.TOTAL, options);
        }
    }

    @step("Verifying products in cart: {0}")
    async verifyProductsInCart(products: CartProduct[], options: VerificationOptions = {}) {
        const rows = this.cartInfoTableRows;
        const rowsCount = await rows.count();
        if (rowsCount !== products.length) {
            throw new Error(`Expected ${products.length} products in cart, but found ${rowsCount}`);
        }
        for (const product of products) {
            const productRow = this.getProductRow({ name: product.name, price: product.price, category: product.category });
            if (await productRow.count() === 0) {
                throw new Error(`Product not found in cart: ${JSON.stringify(product)}`);
            }
            const nameLocator = this.cartProducts.name(productRow);
            await BaseVerification.verifyText(nameLocator, product.name, options);
            const priceLocator = this.cartProducts.price(productRow);
            await BaseVerification.verifyText(priceLocator, product.price, options);
            const quantityLocator = this.cartProducts.quantity(productRow);
            await BaseVerification.verifyText(quantityLocator, product.quantity.toString(), options);
            if (product.imageSrc) {
                const imgLocator = this.cartProducts.image(productRow);
                const expectedImgSrc = product.imageSrc.replace(/^\/+/,'');
                await BaseVerification.verifyElementHasAttribute(imgLocator, 'src', expectedImgSrc, options);
            }
            if (product.category) {
                const categoryLocator = this.cartProducts.category(productRow);
                await BaseVerification.verifyText(categoryLocator, product.category, options);
            }

            const priceText = await priceLocator.innerText();
            const expectedPrice = this.parsePrice(priceText);
            const expectedTotal = expectedPrice.value * product.quantity;
            const totalLocator = this.cartProducts.total(productRow);
            const totalText = await totalLocator.innerText();
            const actualTotalParse = this.parsePrice(totalText);
            const expectFn = BaseVerification.getExpect(options.soft);
            const priceValueErrMsg = `Expected total for product "${product.name}" to be "${expectedTotal}", but found "${actualTotalParse.value}"`;
            await BaseVerification.expectWithLog(() => expectFn(actualTotalParse.value, priceValueErrMsg).toEqual(expectedTotal), priceValueErrMsg);
            const priceCurrencyErrMsg = `Expected currency for product "${product.name}" to be "${expectedPrice.currency}", but found "${actualTotalParse.currency}"`;
            await BaseVerification.expectWithLog(() => expectFn(actualTotalParse.currency, priceCurrencyErrMsg).toEqual(expectedPrice.currency), priceCurrencyErrMsg);
        }
    }

    parsePrice(priceText: string): {currency: string, value: number} {
        const match = priceText.match(/^\s*(\D+)\s*([\d,.]+)\s*$/);
        if (!match) {
            throw new Error(`Invalid price format: ${priceText}`);
        }
        const [, currency, valueText] = match;
        const value = Number(valueText.replace(/,./g, ''));
        return { currency, value };
    }
}