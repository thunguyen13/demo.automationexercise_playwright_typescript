import { Footer } from "@components/Footer";
import { Header } from "@components/Header";
import { Page } from "@playwright/test";
import { step } from "@utils/logger";


export abstract class BasePage {
    constructor(protected page: Page) {}

    public header = new Header(this.page);
    public footer = new Footer(this.page);

    private scrollUpBtn = this.page.locator("#scrollUp");

    @step("Scroll to top")
    async scrollToTop() {
        await this.scrollUpBtn.click();
    }

    @step("Back to previous page")
    async goBack() {
        await this.page.goBack();
    }

    @step("Forward to next page")
    async goForward() {
        await this.page.goForward();
    }

    @step("Refresh the page")
    async refresh() {
        await this.page.reload();
    }
}