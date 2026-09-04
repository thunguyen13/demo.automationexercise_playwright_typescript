import { ListProduct } from "@components/ListProduct";
import { BasePage } from "@core/ui/BasePage";
import { BaseVerification, VerificationOptions } from "@core/ui/BaseVerification";
import { Page } from "@playwright/test";
import { step } from "@utils/logger";

type CardIdentifier = { index: number, name: never } | { index: never, name: string };

export class ProductPage extends BasePage {
    constructor(protected page: Page) {
        super(page);
    }

    public listProduct = new ListProduct(this.page);

    /* ** SELECTORS ** */
    private readonly search = {
        input: this.page.locator('input[id="search_product"]'),
        button: this.page.locator('button[id="submit_search"]'),
    }

    /* ** CONSTANTS ** */
    public readonly PAGE_URL = "/products";
    public readonly PAGE_TITLE = "Automation Exercise - All Products";


    /* ** ACTION METHODS ** */
    @step("Navigating to the Product page")
    async navigateTo() {
        await this.page.goto(this.PAGE_URL);
    }

    @step("Searching for the product with name '{0}'")
    async searchProduct(name: string) {
        await this.search.input.fill(name);
        await this.search.button.click();
    }

    /* ** VERIFICATION METHODS ** */
    @step("Verifying the search results contain '{0}'")
    async verifySearchResults(expectedContainsText: string, expectedHasResult: boolean = true, options: VerificationOptions = {}) {
        const listProductInfo = await this.listProduct.getAllProductCardInfo();
        const expectedLowerText = expectedContainsText.toLowerCase();
        const expectFn = BaseVerification.getExpect(options.soft);

        if (!expectedHasResult) {
            const lengthErrorMsg = `Expected no products to be found, but found ${listProductInfo.length} products`;
            await BaseVerification.expectWithLog(
                () => expectFn(listProductInfo.length, lengthErrorMsg).toBe(0),
                lengthErrorMsg
            );
            return;
        }

        const lengthErrorMsg = `Expected at least 1 product card to be displayed, but found ${listProductInfo.length}`;
        await BaseVerification.expectWithLog(
            () => expectFn(listProductInfo.length, lengthErrorMsg).toBeGreaterThan(0),
            lengthErrorMsg
        );
        for (const productInfo of listProductInfo) {
            const actualLowerName = productInfo.name.toLowerCase();
            const nameErrorMsg = `Expected product name '${productInfo.name}' to contain '${expectedLowerText}'`;
            await BaseVerification.expectWithLog(
                () => expectFn(actualLowerName, nameErrorMsg).toContain(expectedLowerText),
                nameErrorMsg
            );
        }
    }

}