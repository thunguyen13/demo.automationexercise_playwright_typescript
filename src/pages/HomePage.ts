import { ListProduct } from "@components/ListProduct";
import { DEFAULT_URL } from "@config/env.config";
import { BasePage } from "@core/ui/BasePage";
import { BaseVerification, VerificationOptions } from "@core/ui/BaseVerification";
import { Page } from "@playwright/test";
import { step } from "@utils/logger";


export class HomePage extends BasePage {
    public readonly listProduct: ListProduct
    constructor(protected page: Page) {
        super(page);
        this.listProduct = new ListProduct(this.page);
    }

    /* ** SELECTORS ** */

    /* ** CONSTANTS ** */
    public readonly PAGE_URL = DEFAULT_URL.BASE_URL;
    public readonly PAGE_TITLE = "Automation Exercise";

    /* ** ACTION METHODS ** */
    @step("Navigating to Home Page")
    async navigateTo() {
        await this.page.goto("/");
    }

    /* ** VERIFICATION METHODS ** */
    @step("Verifying current page is Home Page")
    async verifyCurrentPage(options: VerificationOptions = {}) {
        const expectedUrl = `${DEFAULT_URL.BASE_URL}/`;
        await BaseVerification.verifyCurrentUrl(this.page, expectedUrl, options);
        await BaseVerification.verifyPageTitle(this.page, this.PAGE_TITLE, options);
        await this.header.verifyItemIsSelected("home", options);
    }

}