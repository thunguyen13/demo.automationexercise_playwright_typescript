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

    @step("Wait for page load")
    async waitForPageLoad(waitType: "load" | "domcontentloaded" | "networkidle" = "load", timeout?: number) {
        await this.page.waitForLoadState(waitType, { timeout });
    }

    @step("Back to previous page")
    async goBack(waitType: "load" | "domcontentloaded" | "networkidle" = "load", timeout?: number) {
        await this.page.goBack({ waitUntil: waitType, timeout });
    }

    @step("Forward to next page")
    async goForward(waitType: "load" | "domcontentloaded" | "networkidle" = "load", timeout?: number) {
        await this.page.goForward({ waitUntil: waitType, timeout });
    }

    @step("Refresh the page")
    async refresh(waitType: "load" | "domcontentloaded" | "networkidle" = "load", timeout?: number) {
        await this.page.reload({ waitUntil: waitType, timeout });
    }
}