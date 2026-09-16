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
        await this.verifyElementIsVisible(locator, options);
        const errorHaveTextMsg = `Expected locator "${locator.toString()}" to have text "${expectedText}"`;
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
        await this.verifyElementIsVisible(fieldLocator, options);
        const errorMsg = `Expected field "${fieldLocator.toString()}" to have value "${expectedValue}"`;
        await this.expectWithLog(() => expectFn(fieldLocator, errorMsg).toHaveValue(expectedValue, { timeout: options.timeout }), errorMsg);
    }

    static async verifyElementIsVisible(locator: Locator, options: VerificationOptions = {}) {
        const expectFn = this.getExpect(options.soft);
        const errorMsg = `Expected locator "${locator.toString()}" to be visible`;
        await this.expectWithLog(() => expectFn(locator, errorMsg).toBeVisible({ timeout: options.timeout }), errorMsg);
    }

    static async verifyElementIsHidden(locator: Locator, options: VerificationOptions = {}) {
        const expectFn = this.getExpect(options.soft);
        const errorMsg = `Expected locator "${locator.toString()}" to be hidden`;
        await this.expectWithLog(() => expectFn(locator, errorMsg).toBeHidden({ timeout: options.timeout }), errorMsg);
    }

    static async verifyAttribute(locator: Locator, attributeName: string, expectedValue: string | RegExp, options: VerificationOptions = {}) {
        const expectFn = this.getExpect(options.soft);
        await this.verifyElementIsVisible(locator, options);
        const errorAttributeMsg = `Expected locator "${locator.toString()}" to have attribute "${attributeName}" with value "${expectedValue}"`;
        await this.expectWithLog(() => expectFn(locator, errorAttributeMsg).toHaveAttribute(attributeName, expectedValue, { timeout: options.timeout }), errorAttributeMsg);
    }

    static async verifyElementCssProperty(locator: Locator, propertyName: string, expectedValue: string | RegExp, options: VerificationOptions = {}) {
        const expectFn = this.getExpect(options.soft);
        await this.verifyElementIsVisible(locator, options);
        const errorCssPropertyMsg = `Expected locator "${locator.toString()}" to have CSS property "${propertyName}" with value "${expectedValue}"`;
        await this.expectWithLog(() => expectFn(locator, errorCssPropertyMsg).toHaveCSS(propertyName, expectedValue, { timeout: options.timeout }), errorCssPropertyMsg);
    }

    static async verifyElementHasAttribute(locator: Locator, attributeName: string, attributeValue: string | RegExp, options: VerificationOptions = {}) {
        const expectFn = this.getExpect(options.soft);
        await this.verifyElementIsVisible(locator, options);
        const errorAttributeMsg = `Expected locator "${locator.toString()}" to have attribute "${attributeName}"`;
        await this.expectWithLog(() => expectFn(locator, errorAttributeMsg).toHaveAttribute(attributeName, attributeValue, { timeout: options.timeout }), errorAttributeMsg);
    }
}