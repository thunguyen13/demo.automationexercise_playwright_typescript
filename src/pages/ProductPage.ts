import { ListProduct } from "@components/ListProduct";
import { BasePage } from "@core/ui/BasePage";
import { Locator, Page } from "@playwright/test";
import { step } from "@utils/logger";

type CardIdentifier = { index: number, name: never } | { index: never, name: string };

export class ProductPage extends BasePage {
    constructor(protected page: Page) {
        super(page);
    }

    public listProduct = new ListProduct(this.page);

    /* ** SELECTORS ** */
    private readonly search = {
        input: this.page.locator('#search_product'),
        button: this.page.locator('#submit_search'),
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
    async searchForProduct(name: string) {
        await this.search.input.fill(name);
        await this.search.button.click();
    }

}