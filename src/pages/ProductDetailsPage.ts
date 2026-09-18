import { CartModal } from "@components/CartModal";
import { CardInfo } from "@components/ListProduct";
import { BasePage } from "@core/ui/BasePage";
import { BaseVerification, VerificationOptions } from "@core/ui/BaseVerification";
import { Page } from "@playwright/test";
import { step } from "@utils/logger";

export type ProductDescription = {
    category?: string;
    availability?: string;
    condition?: string;
    brand?: string;
}

export class ProductDetailsPage extends BasePage {
    public readonly cartModal: CartModal;
    constructor(protected page: Page) {
        super(page);
        this.cartModal = new CartModal(this.page);
    }

    /* ** SELECTORS ** */
    private readonly productDetailsContainer = this.page.locator('div[class="product-details"]');
    private readonly productDetails = {
        image: this.productDetailsContainer.locator('div[class="view-product"] > img'),
        tagNew: this.productDetailsContainer.locator('div[class="product-information"] img[class="newarrival"]'),
        name: this.productDetailsContainer.locator('div[class="product-information"] h2'),
        category: this.productDetailsContainer.getByText(/category/i),
        rating: this.productDetailsContainer.locator('div[class="product-information"] img[src*="rating"]'),
        price: this.productDetailsContainer.locator('div[class="product-information"] > span > span'),
        quantityInput: this.productDetailsContainer.locator('div[class="product-information"] input[id="quantity"]'),
        addToCartButton: this.productDetailsContainer.getByRole('button', { name: 'Add to cart' }),
        availability: this.productDetailsContainer.locator('p', { hasText: /availability/i }),
        condition: this.productDetailsContainer.locator('p', { hasText: /condition/i }),
        brand: this.productDetailsContainer.locator('p', { hasText: /brand/i }),
    }

    /* ** CONSTANTS ** */
    public readonly PAGE_TITLE = "Automation Exercise - Product Details";
    public readonly PAGE_URL = "/product_details";


    /* ** ACTION METHODS ** */
    @step("Getting product details")
    async getProductDetails(): Promise<CardInfo & ProductDescription> {
        const currentUrl = this.page.url();
        const id = currentUrl.split("/").pop();
        const name = await this.productDetails.name.textContent();
        const price = await this.productDetails.price.textContent();
        const imageSrc = await this.productDetails.image.getAttribute("src");
        const category = await this.productDetails.category.textContent();
        const availability = await this.productDetails.availability.textContent();
        const condition = await this.productDetails.condition.textContent();
        const brand = await this.productDetails.brand.textContent();
        return {
            id: id ?? "",
            name: name ?? "",
            price: price ?? "",
            imageSrc,
            category: category?.replace(/Category:/i, "").trim(),
            availability: availability?.replace(/Availability:/i, "").trim(),
            condition: condition?.replace(/Condition:/i, "").trim(),
            brand: brand?.replace(/Brand:/i, "").trim(),
        }
    }

    @step("Adding product to cart with quantity '{1}'")
    async addProductToCart(quantity: number = 1) {
        await this.productDetails.quantityInput.fill(quantity.toString());
        await this.productDetails.addToCartButton.click();
    }

    /* ** VERIFICATION METHODS ** */
    @step("Verifying current page with product details: {0}")
    async verifyCurrentPage(producDetails: CardInfo, options: VerificationOptions = {}) {
        const expectedUrl = new RegExp(`${this.PAGE_URL}/${producDetails.id}$`);
        await BaseVerification.verifyCurrentUrl(this.page, expectedUrl, options);
        await BaseVerification.verifyPageTitle(this.page, this.PAGE_TITLE, options);
        await this.verifyProductSummary(producDetails, options);
    }

    @step("Verifying product identity with expected details: {0}")
    async verifyProductSummary(expected: CardInfo, options: VerificationOptions = {}) {
        await BaseVerification.verifyText(this.productDetails.name, expected.name, options);
        await BaseVerification.verifyText(this.productDetails.price, expected.price, options);
        await BaseVerification.verifyAttribute(this.productDetails.image, "src", expected.imageSrc ?? "", options);
    }

    // @step("Verifying product details with expected details: {0}")
    // async verifyProductDetails(expected: ProductDetails, options: VerificationOptions = {}) {
    //     if (Object.keys(expected).length === 0) {
    //         throw new Error("Expected product details cannot be empty");
    //     }
    //     if (expected.category !== undefined) {
    //         console.log(`==> Verifying product category: expected='${expected.category}'`);
    //         await BaseVerification.verifyText(this.productDetails.category, expected.category, options);
    //     }
    //     if (expected.condition !== undefined) {
    //         console.log(`==> Verifying product condition: expected='${expected.condition}'`);
    //         await BaseVerification.verifyText(this.productDetails.condition, expected.condition, options);
    //     }
    //     if (expected.availability !== undefined) {
    //         console.log(`==> Verifying product availability: expected='${expected.availability}'`);
    //         await BaseVerification.verifyText(this.productDetails.availability, expected.availability, options);
    //     }
    //     if (expected.brand !== undefined) {
    //         console.log(`==> Verifying product brand: expected='${expected.brand}'`);
    //         await BaseVerification.verifyText(this.productDetails.brand, expected.brand, options);
    //     }
    // }

    @step("Verifying product details with expected details: {0}")
    async verifyProductDescription(expected: ProductDescription, options: VerificationOptions = {}) {
        const expectFn = BaseVerification.getExpect(options.soft);
        const actualProductDetails = await this.getProductDetails();
        if (Object.keys(expected).length === 0) {
            throw new Error("Expected product details cannot be empty");
        }
        if (expected.category !== undefined) {
            console.log(`==> Verifying product category: expected='${expected.category}'`);
            const errorMsg = `Expected product category to be '${expected.category}' but found '${actualProductDetails.category}'`;
            await BaseVerification.expectWithLog(() => expectFn(actualProductDetails.category, errorMsg).toEqual(expected.category), errorMsg);
        }
        if (expected.condition !== undefined) {
            console.log(`==> Verifying product condition: expected='${expected.condition}'`);
            const errorMsg = `Expected product condition to be '${expected.condition}' but found '${actualProductDetails.condition}'`;
            await BaseVerification.expectWithLog(() => expectFn(actualProductDetails.condition, errorMsg).toEqual(expected.condition), errorMsg);
        }
        if (expected.availability !== undefined) {
            console.log(`==> Verifying product availability: expected='${expected.availability}'`);
            const errorMsg = `Expected product availability to be '${expected.availability}' but found '${actualProductDetails.availability}'`;
            await BaseVerification.expectWithLog(() => expectFn(actualProductDetails.availability, errorMsg).toEqual(expected.availability), errorMsg);
        }
        if (expected.brand !== undefined) {
            console.log(`==> Verifying product brand: expected='${expected.brand}'`);
            const errorMsg = `Expected product brand to be '${expected.brand}' but found '${actualProductDetails.brand}'`;
            await BaseVerification.expectWithLog(() => expectFn(actualProductDetails.brand, errorMsg).toEqual(expected.brand), errorMsg);
        }
    }
}