import { expect, Locator, Page } from "@playwright/test";

export type VerificationOptions = {
    timeout?: number;
    soft?: boolean;
};


export class BaseVerification {

    static getExpect(soft: boolean = false) {
        return soft ? expect.soft : expect;
    }

    static async expectWithLog(
        expectation: () => Promise<void> | void,
        message: string,
    ): Promise<void> {
        await expectation();
        console.log(`[VERIFICATION] => PASSED: ${message}`);
    }

    /**
     * To verify the title of the page
     * @param page - playwright page object
     * @param expectedTitle - expected title of the page
     * @param options - Optional parameters for verification
     */
    static async verifyPageTitle(page: Page, expectedTitle: string, options: VerificationOptions = {}) {
        const expectFn = this.getExpect(options.soft);
        const errorMsg = `Expected page title to be "${expectedTitle}"`;
        await this.expectWithLog(() => expectFn(page, errorMsg).toHaveTitle(expectedTitle, { timeout: options.timeout }), `${errorMsg}`);
    }
    
    /**
     * To verify the text of a locator
     * @param locator - playwright locator object
     * @param expectedText - expected text of the locator
     * @param options - Optional parameters for verification
     */
    static async verifyText(locator: Locator, expectedText: string | RegExp, options: VerificationOptions = {}) {
        const expectFn = this.getExpect(options.soft);
        const locatorStr = locator.toString();
        const errorVisibleMsg = `Expected locator "${locatorStr}" to be visible`;
        await this.expectWithLog(() => expectFn(locator, errorVisibleMsg).toBeVisible({ timeout: options.timeout }), errorVisibleMsg);
        const errorHaveTextMsg = `Expected locator "${locatorStr}" to have text "${expectedText}"`;
        await this.expectWithLog(() => expectFn(locator, errorHaveTextMsg).toHaveText(expectedText, { timeout: options.timeout }), errorHaveTextMsg);
    }

    /**
     * To verify the current URL of the page
     * @param page - playwright page object
     * @param expectedUrl - expected URL of the page
     * @param options - Optional parameters for verification
     */
    static async verifyCurrentUrl(page: Page, expectedUrl: string | RegExp, options: VerificationOptions = {}) {
        const expectFn = this.getExpect(options.soft);
        const errorMsg = `Expected current URL to match "${expectedUrl}"`;
        await this.expectWithLog(() => expectFn(page, errorMsg).toHaveURL(expectedUrl, { timeout: options.timeout }), errorMsg);
    }

    /**
     * To verify if a field is invalid (validated by browser)
     * @param fieldLocator - playwright locator object
     * @param options - Optional parameters for verification
     */
    static async verifyFieldIsInvalid(fieldLocator: Locator, options: VerificationOptions = {}) {
        const expectFn = this.getExpect(options.soft);
        const errorMsg = `Expected field "${fieldLocator.toString()}" to be invalid (validated by browser)`;
        const isInvalid = await fieldLocator.evaluate(el => el.matches(":invalid"), { timeout: options.timeout });
        await this.expectWithLog(() => expectFn(isInvalid, errorMsg).toBe(true), errorMsg);
    }

    /**
     * To verify the value of a field
     * @param fieldLocator - playwright locator object
     * @param expectedValue - expected value of the field
     * @param options - Optional parameters for verification
     */
    static async verifyFieldValue(fieldLocator: Locator, expectedValue: string, options: VerificationOptions = {}) {
        const expectFn = this.getExpect(options.soft);
        const errorMsg = `Expected field "${fieldLocator.toString()}" to have value "${expectedValue}"`;
        await this.expectWithLog(() => expectFn(fieldLocator, errorMsg).toHaveValue(expectedValue, { timeout: options.timeout }), errorMsg);
    }
}