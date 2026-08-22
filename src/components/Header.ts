import { BaseVerification, VerificationOptions } from "@core/ui/BaseVerification";
import { Page } from "@playwright/test";
import { step } from "@utils/logger";



export class Header {
    constructor(private page: Page) {}

    private readonly header = this.page.locator("#header");
    private readonly logo = this.header.getByAltText("Website for automation practice");
    private readonly menuItems = {
        home: this.header.getByRole("link", { name: "Home" }),
        products: this.header.getByRole("link", { name: "Products" }),
        cart: this.header.getByRole("link", { name: "Cart" }),
        signUpLogIn: this.header.getByRole("link", { name: "Signup / Login" }),
        contactUs: this.header.getByRole("link", { name: "Contact us" }),
        logOut: this.header.getByRole("link", { name: "Logout" }),
        deleteAccount: this.header.getByRole("link", { name: "Delete Account" }),
        loggedInAs: this.header.getByRole("listitem").filter({ hasText: "Logged in as" }),
    }

    /**
     * Click on the logo in the header
     */
    @step("Clicking on the logo")
    async clickLogo() {
        await this.logo.click();
    }

    /**
     * Click on a menu item
     * @param item - The menu item to click on. Must be a key of the `menuItems` object.
     */
    @step("Clicking on the menu item: '{0}'")
    async clickMenuItem(item: keyof typeof this.menuItems) {
        await this.menuItems[item].click();
    }

    /**
     * Verify that a menu item is visible
     * @param item - The menu item to verify. Must be a key of the `menuItems` object.
     * @param options - Optional parameters for verification
     */
    @step("Verifying that the menu item: '{0}' is visible")
    async verifyItemIsVisible(item: keyof typeof this.menuItems, options: VerificationOptions = {}) {
        await BaseVerification.verifyElementIsVisible(this.menuItems[item], options);
    }

    @step("Verifying that the menu item: '{0}' is hidden")
    async verifyItemIsHidden(item: keyof typeof this.menuItems, options: VerificationOptions = {}) {
        await BaseVerification.verifyElementIsHidden(this.menuItems[item], options);
    }

    /**
     * Verify that the "Logged in as" menu item contains the expected text
     * @param expectedText - The expected text to verify in the "Logged in as" menu item.
     * @param options - Optional parameters for verification
     */
    @step("Verifying that the menu item: '{0}' is not visible")
    async verifyLoggedInAsText(expectedText: string, options: VerificationOptions = {}) {
        await BaseVerification.verifyText(this.menuItems.loggedInAs, expectedText, options);
    }
}