import { BasePage } from "@core/ui/BasePage";
import { Page } from "@playwright/test";
import { step } from "@utils/logger";


export class HomePage extends BasePage {
    constructor(protected page: Page) {
        super(page);
    }

    /* ** SELECTORS ** */

    /* ** CONSTANTS ** */
    public readonly PAGE_TITLE = "Automation Exercise";

    /* ** ACTION METHODS ** */
    @step("Navigating to Home Page")
     async navigateTo() {
        await this.page.goto("/");
    }

}