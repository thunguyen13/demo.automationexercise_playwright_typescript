import { BaseComponent } from "@core/ui/BaseComponent";
import { Page } from "@playwright/test";



export class Footer extends BaseComponent {
    constructor(protected page: Page) {
        super(page);
    }

    private readonly footer = this.page.locator("#footer");
    private readonly subcriptionText = this.footer.locator("h2");
    private readonly form = {
        inputField: this.footer.locator("input[id='susbscribe_email']"),
        submitButton: this.footer.locator("button[id='subscribe']"),
    };

} 