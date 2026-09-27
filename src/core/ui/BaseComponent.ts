import { Footer } from "@components/Footer";
import { Header } from "@components/Header";
import { Page } from "@playwright/test";
import { step } from "@utils/logger";


export abstract class BaseComponent {
    constructor(protected page: Page) {}

    @step("Waiting for the page to become ready")
    async waitForReady(waitType: "load" | "domcontentloaded" | "networkidle" = "load", timeout?: number) {
        await this.page.waitForLoadState(waitType, { timeout });
    }
}