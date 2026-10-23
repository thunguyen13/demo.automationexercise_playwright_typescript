import { BaseComponent } from "@core/ui/BaseComponent";
import { BaseVerification, VerificationOptions } from "@core/ui/BaseVerification";
import { Locator, Page } from "@playwright/test";
import { ParsedPrice, parsePrice } from "@utils/helpers";
import { step } from "@utils/logger";

export type ProductRowIdentifier = {
    name: string;
    category?: string;
    price?: string;
}

export type CartProduct = {
    name: string;
    category?: string;
    price: string;
    quantity: number;
    imageSrc?: string | null;
}

export class CartTable extends BaseComponent {
    private readonly container: Locator;
    private readonly cartInfoTable: Locator;
    private readonly cartInfoTableHeaders: {
        item: Locator;
        description: Locator;
        quantity: Locator;
        price: Locator;
        total: Locator;
    };

    private readonly cartInfoTableRows: Locator;
    private readonly cartProducts: {
        image: (row?: Locator) => Locator;
        name: (row?: Locator) => Locator;
        category: (row?: Locator) => Locator;
        price: (row?: Locator) => Locator;
        quantity: (row?: Locator) => Locator;
        total: (row?: Locator) => Locator;
    };

    constructor(page: Page, container: Locator) {
        super(page);
        /* ** SELECTORS ** */
        this.container = container;
        this.cartInfoTable = this.container.locator('table[class="table table-condensed"]');
        this.cartInfoTableHeaders = {
            item: this.cartInfoTable.locator('thead td[class="image"]'),
            description: this.cartInfoTable.locator('thead td[class="description"]'),
            quantity: this.cartInfoTable.locator('thead td[class="quantity"]'),
            price: this.cartInfoTable.locator('thead td[class="price"]'),
            total: this.cartInfoTable.locator('thead td[class="total"]'),
        }
        this.cartInfoTableRows = 
            this.cartInfoTable.locator('tbody tr')
                .filter({
                    hasNotText: 'Total Amount'
                });
        this.cartProducts = {
            image: (row?: Locator) => (row ?? this.cartInfoTableRows).locator('td[class="cart_product"] img'),
            name: (row?: Locator) => (row ?? this.cartInfoTableRows).locator('td[class="cart_description"] h4 a'),
            category: (row?: Locator) => (row ?? this.cartInfoTableRows).locator('td[class="cart_description"] p'),
            price: (row?: Locator) => (row ?? this.cartInfoTableRows).locator('td[class="cart_price"] p'),
            quantity: (row?: Locator) => (row ?? this.cartInfoTableRows).locator('td[class="cart_quantity"] button'),
            total: (row?: Locator) => (row ?? this.cartInfoTableRows).locator('td[class="cart_total"] p'),
        };
    }

    /* ** CONSTANTS ** */
    public readonly HEADERS = {
            ITEM: "Item",
            DESCRIPTION: "Description",
            PRICE: "Price",
            QUANTITY: "Quantity",
            TOTAL: "Total",
        };

    /* ** ACTION METHODS ** */
    getProductRow(by: ProductRowIdentifier) {
        const rows = this.cartInfoTableRows;
        let row = rows.filter({
            hasText: by.name
        })
        if (by.price) {
            row = row.filter({
                hasText: by.price
            })
        }
        if (by.category) {
            row = row.filter({
                hasText: by.category
            })
        }
        return row;
    }

    /* ** VERIFICATION METHODS ** */
    @step("Verifying cart table is displayed with correct headers")
    async verifyCartTableIsDisplayed(options: VerificationOptions = {}) {
        await BaseVerification.verifyElementIsVisible(this.cartInfoTable, options);
        await BaseVerification.verifyText(this.cartInfoTableHeaders.item, this.HEADERS.ITEM, options);
        await BaseVerification.verifyText(this.cartInfoTableHeaders.description, this.HEADERS.DESCRIPTION, options);
        await BaseVerification.verifyText(this.cartInfoTableHeaders.price, this.HEADERS.PRICE, options);
        await BaseVerification.verifyText(this.cartInfoTableHeaders.quantity, this.HEADERS.QUANTITY, options);
        await BaseVerification.verifyText(this.cartInfoTableHeaders.total, this.HEADERS.TOTAL, options);
    }

    @step("Verifying cart table is not displayed")
    async verifyCartTableIsNotDisplayed(options: VerificationOptions = {}) {
        await BaseVerification.verifyElementIsHidden(this.cartInfoTable, options);
    }

    @step("Verifying products in cart: {0}")
    async verifyProductsInCart(products: CartProduct[], options: VerificationOptions = {}) {
        const rows = this.cartInfoTableRows;
        const actualRowCount = await rows.count();
        const expectedRowCount = products.length;
        const expectFn = BaseVerification.getExpect(options.soft);
        const errMsg = `Expected ${expectedRowCount} row(s) in cart, but found ${actualRowCount} row(s)`;
        await BaseVerification.expectWithLog(() => expectFn(actualRowCount, errMsg).toEqual(expectedRowCount), errMsg);
        
        for (const product of products) {
            const productRow = this.getProductRow({ name: product.name, price: product.price, category: product.category });
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

            await this.verifyProductTotalPrice(product, productRow, options);
        }
    }    

    async verifyProductTotalPrice(product: CartProduct, productRow: Locator, options: VerificationOptions = {}) {
        const expectFn = BaseVerification.getExpect(options.soft);
        const expectedTotal = this.calTotalPrice(product);
        const totalLocator = this.cartProducts.total(productRow);
        const totalText = await totalLocator.innerText();
        const actualTotal = parsePrice(totalText);
        const totalErrMsg = `Expected total for product "${product.name}" to be "${expectedTotal.currency} ${expectedTotal.value}", but found "${actualTotal.currency} ${actualTotal.value}"`;
        await BaseVerification.expectWithLog(() => expectFn(actualTotal, totalErrMsg).toEqual(expectedTotal), totalErrMsg);
    }

    calTotalPrice(product: CartProduct): ParsedPrice {
        const priceText = product.price;
        const quantity = product.quantity;
        const price = parsePrice(priceText);
        const total = price.value * quantity;
        return {
            currency: price.currency,
            value: total
        }
    }

}