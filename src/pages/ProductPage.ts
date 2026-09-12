import { BrandName, ListProduct, MainCategory, SubCategory } from "@components/ListProduct";
import { BasePage } from "@core/ui/BasePage";
import { BaseVerification, VerificationOptions } from "@core/ui/BaseVerification";
import { Page } from "@playwright/test";
import { step } from "@utils/logger";

type FilteredBy = {
    mainCategory: MainCategory,
    subCategory: SubCategory
    brand?: never
} | {
    mainCategory?: never,
    subCategory?: never,
    brand: BrandName
}

export class ProductPage extends BasePage {
    public readonly listProduct: ListProduct;
    constructor(protected page: Page) {
        super(page);
        this.listProduct = new ListProduct(this.page);
    }

    /* ** SELECTORS ** */
    private readonly search = {
        input: this.page.locator('input[id="search_product"]'),
        button: this.page.locator('button[id="submit_search"]'),
    }
    private readonly filterBreadcrumb = this.page.locator('ol[class="breadcrumb"] li[class="active"]');

    /* ** CONSTANTS ** */
    public readonly PAGE_URL = "/products";
    public readonly PAGE_TITLE = "Automation Exercise - All Products";


    /* ** ACTION METHODS ** */
    @step("Getting the current filter breadcrumb text")
    async getCurrentFilterBreadcrumbText() {
        return await this.filterBreadcrumb.innerText();
    }

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

    async verifyCurrentPage(isFilteredBy?: FilteredBy, options: VerificationOptions = {}) {
        const expectedUrlRegex = new RegExp(`${this.PAGE_URL}$`)
        await BaseVerification.verifyCurrentUrl(this.page, expectedUrlRegex, options);
        if (!isFilteredBy) {
            await BaseVerification.verifyPageTitle(this.page, this.PAGE_TITLE, options);
            await this.listProduct.verifyHeaderText("All Products", options);
        } else {
            const expectedTitle = this.PAGE_TITLE.replace("All", `${isFilteredBy.brand || isFilteredBy.subCategory}`);
            await BaseVerification.verifyPageTitle(this.page, expectedTitle, options);
            const expectedBreadcrumb = isFilteredBy.brand ? `${isFilteredBy.brand}` : `${isFilteredBy.mainCategory} > ${isFilteredBy.subCategory}`;
            await BaseVerification.verifyText(this.filterBreadcrumb, expectedBreadcrumb, options);
            const expectedListProductHeader = isFilteredBy.brand ? `Brand - ${isFilteredBy.brand} Products` : `${isFilteredBy.mainCategory} - ${isFilteredBy.subCategory} Products`;
            await this.listProduct.verifyHeaderText(expectedListProductHeader, options);
        }
        await this.header.verifyItemIsSelected("products", options);
    }
}