import { CardInfo } from "@components/ListProduct";
import { BasePage } from "@core/ui/BasePage";
import { BaseVerification, VerificationOptions } from "@core/ui/BaseVerification";
import { Page } from "@playwright/test";
import { step } from "@utils/logger";

export type ProductDetails = {
    category?: string;
    availability?: string;
    condition?: string;
    brand?: string;
}

export class ProductDetailsPage extends BasePage {
    constructor(protected page: Page) {
        super(page);
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


    /* ** ACTION METHODS ** */
    @step("Adding product to cart with quantity '{0}'")
    async addProductToCart(quantity: number = 1) {
        await this.productDetails.quantityInput.fill(quantity.toString());
        await this.productDetails.addToCartButton.click();
    }

    /* ** VERIFICATION METHODS ** */
    @step("Verifying product identity with expected details: {0}")
    async verifyProductSummary(expected: CardInfo, options: VerificationOptions = {}) {
        await BaseVerification.verifyText(this.productDetails.name, expected.name, options);
        await BaseVerification.verifyText(this.productDetails.price, expected.price, options);
        await BaseVerification.verifyAttribute(this.productDetails.image, "src", expected.imageSrc ?? "", options);
    }

    @step("Verifying product details with expected details: {0}")
    async verifyProductDetails(expected: ProductDetails, options: VerificationOptions = {}) {
        if (Object.keys(expected).length === 0) {
            throw new Error("Expected product details cannot be empty");
        }
        if (expected.category !== undefined) {
            console.log(`==> Verifying product category: expected='${expected.category}'`);
            await BaseVerification.verifyText(this.productDetails.category, expected.category, options);
        }
        if (expected.condition !== undefined) {
            console.log(`==> Verifying product condition: expected='${expected.condition}'`);
            await BaseVerification.verifyText(this.productDetails.condition, expected.condition, options);
        }
        if (expected.availability !== undefined) {
            console.log(`==> Verifying product availability: expected='${expected.availability}'`);
            await BaseVerification.verifyText(this.productDetails.availability, expected.availability, options);
        }
        if (expected.brand !== undefined) {
            console.log(`==> Verifying product brand: expected='${expected.brand}'`);
            await BaseVerification.verifyText(this.productDetails.brand, expected.brand, options);
        }
    }
}