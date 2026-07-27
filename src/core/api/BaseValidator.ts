import { expect } from "@playwright/test";
import Ajv from "ajv";
import { getDuplicateByKey, getValueFieldByPath } from "@utils/helpers";
import { ApiResponse } from "./ApiClient";

type ValidatorOptions = {
    soft?: boolean; // If true, use expect.soft for assertions
    timeout?: number;
};

export class BaseValidator {

    static getExpect(soft: boolean = false) {
        return soft ? expect.soft : expect;
    }

    /**
     * To validate that the response status code matches the expected status code.
     * @param response - The response to validate
     * @param expectedStatus - The expected status code to compare against the actual response status code
     * @param options - Optional configuration for the validator
     */
    static validateStatusCode(response: ApiResponse, expectedStatus: number, options: ValidatorOptions = {}) {
        const expectFn = this.getExpect(options.soft);
        const actualStatus = response.status;
        const msg = `Expected status code ${expectedStatus}, but got ${actualStatus}`;
        expectFn(actualStatus, msg).toBe(expectedStatus);
        console.log(`==> Status code ${actualStatus} is as expected.`);
    }

    /**
     * To validate that the response content type matches the expected content type.
     * @param response - The response to validate
     * @param expectedContentType - The expected content type to compare against the actual response content type
     * @param options - Optional configuration for the validator
     */
    static validateContentType(response: ApiResponse, expectedContentType: string, options: ValidatorOptions = {}) {
        const expectFn = this.getExpect(options.soft);
        const actualContentType = response.headers["content-type"];
        const msg = `Expected content type ${expectedContentType}, but got ${actualContentType}`;
        expectFn(actualContentType, msg).toBe(expectedContentType);
        console.log(`==> Content type ${actualContentType} is as expected.`);
    }

    /**
     * To validate that the response body contains all the required fields specified in the requiredFields array.
     * @param response - The response to validate
     * @param requiredFields - An array of required field names that should be present in the response body
     * @param options - Optional configuration for the validator
     */
    static validateRequiredFields(response: ApiResponse, requiredFields: string[], options: ValidatorOptions = {}) {
        const expectFn = this.getExpect(options.soft);
        const body = response.body;
        requiredFields.forEach(field => {
            const msg = `Response body is missing required field: ${field}`;
            expectFn(body, msg).toHaveProperty(field);
            console.log(`==> Required field '${field}' is present in the response body.`);    
        });
    }

    /**
     * 
     * @param response - The response to validate
     * @param path - The path to the field relative to the response body. Supports dot notation and array indices (e.g. "user.address[0].street").     * @param expectedValue - The expected value of the field at the specified path in the response body
     * @param options - Optional configuration for the validator
     */
    static validateFieldValue(response: ApiResponse, path: string, expectedValue: unknown, options: ValidatorOptions = {}) {
        const expectFn = this.getExpect(options.soft);
        const actualValue = this.getActualValueByPath(response, path);
        const msg = `Expected field '${path}' to have value ${JSON.stringify(expectedValue)}, but got ${JSON.stringify(actualValue)}`;
        expectFn(actualValue, msg).toBe(expectedValue);
        console.log(`==> Field '${path}' has value "${actualValue}" as expected.`);
    }

    /**
     * To validate that the field at the specified path in the response body is not empty.
     * @param response - The response to validate
     * @param path - The path to the field relative to the response body. Supports dot notation and array indices (e.g. "user.address[0].street").
     * @param options - Optional configuration for the validator
     */
    static validateFieldValueNotEmpty(response: ApiResponse, path: string, options: ValidatorOptions = {}) {
        const expectFn = this.getExpect(options.soft);
        const actualValue = this.getActualValueByPath(response, path);
        const msg = `Expected field '${path}' to not be empty.`;
        expectFn(actualValue, msg).not.toBe('');
        console.log(`==> Field '${path}' has a non-empty value as expected.`);
    }

    /**
     * To validate that the field at the specified path in the response body matches the given regular expression pattern.
     * @param response - The response to validate
     * @param path - The path to the field relative to the response body. Supports dot notation and array indices (e.g. "user.address[0].street").
     * @param pattern - The regular expression pattern to match, e.g. /abc/
     * @param options - Optional configuration for the validator
     */
    static validateFieldValueMatchPattern(response: ApiResponse, path: string, pattern: RegExp|string, options: ValidatorOptions = {}) {
        const expectFn = this.getExpect(options.soft);
        const actualValue = this.getActualValueByPath(response, path);
        const msg = `Expected field '${path}' to match pattern ${pattern}, but got ${actualValue}`;
        expectFn(actualValue, msg).toMatch(pattern);
        console.log(`==> Field '${path}' has value "${actualValue}" that matches the pattern ${pattern} as expected.`);
    }

    /**
     * To validate that the field at the specified path in the response body contains the expected text (case-insensitive).
     * @param response - The response to validate
     * @param path - The path to the field relative to the response body. Supports dot notation and array indices (e.g. "user.address[0].street").
     * @param expectedText - The expected text that should be contained in the field value (case-insensitive).
     * @param options - Optional configuration for the validator
     */
    static validateFieldValueContainsText(response: ApiResponse, path: string, expectedText: string, options: ValidatorOptions = {}) {
        const expectFn = this.getExpect(options.soft);
        const actualValue = this.getActualValueByPath(response, path);
        const actualValueLower = String(actualValue).toLowerCase();
        const expectedTextLower = String(expectedText).toLowerCase();
        const msg = `Expected field '${path}' to contain text "${expectedTextLower}", but got "${actualValueLower}"`;
        expectFn(actualValueLower, msg).toContain(expectedTextLower);
        console.log(`==> Field '${path}' has value "${actualValueLower}" when expected text is "${expectedTextLower}"`);
    }

    /**
     * To validate that the field at the specified path in the response body is an empty array.
     * @param response - The response to validate
     * @param path - The path to the field relative to the response body. Supports dot notation and array indices (e.g. "user.address[0].street").
     * @param options - Optional configuration for the validator
     */
    static validateFieldValueIsEmptyArray(response: ApiResponse, path: string, options: ValidatorOptions = {}) {
        const expectFn = this.getExpect(options.soft);
        const actualValue = this.getActualValueByPath(response, path);
        const msgNotArray = `Expected field '${path}' to be an array, but got ${typeof actualValue}`;
        expectFn(Array.isArray(actualValue), msgNotArray).toBe(true);
        const msgNotEmpty = `Expected field '${path}' to be an empty array, and it has length ${actualValue.length}`;
        expectFn(actualValue.length, msgNotEmpty).toBe(0);
        console.log(`==> Field '${path}' is an empty array as expected.`);
    }

    /**
     * To validate that the field at the specified path in the response body is a non-empty array.
     * @param response - The response to validate
     * @param path - The path to the field relative to the response body. Supports dot notation and array indices (e.g. "user.address[0].street").
     * @param options - Optional configuration for the validator
     */
    static validateFieldValueIsNonEmptyArray(response: ApiResponse, path: string, options: ValidatorOptions = {}) {
        const expectFn = this.getExpect(options.soft);
        const actualValue = this.getActualValueByPath(response, path);
        const msgNotArray = `Expected field '${path}' to be an array, but got ${typeof actualValue}`;
        expectFn(Array.isArray(actualValue), msgNotArray).toBe(true);
        const msgEmpty = `Expected field '${path}' to be a non-empty array.`;
        expectFn(actualValue.length, msgEmpty).toBeGreaterThan(0);
        console.log(`==> Field '${path}' is a non-empty array as expected.`);
    }

    /**
     * To validate that the response body contains an error message that matches the expected message.
     * @param response - The response to validate
     * @param expectedMessage - The expected error message that should be present in the response body
     * @param options - Optional configuration for the validator
     */
    static validateErrorResponse(response: ApiResponse, expectedMessage: string, options: ValidatorOptions = {}) {
        const expectFn = this.getExpect(options.soft);
        const body = response.body;
        const msgLackingErrorField = `Expected an error message in response, and the response body contain an 'message' field.`;
        if (typeof body !== "object" || body == null || !( "message" in body )) throw new Error(msgLackingErrorField);
        // expect(body, msgLackingErrorField).toHaveProperty("message");
        const actualRes = body.message;
        const msgNotMatchingError = `Expected error message to be ${expectedMessage}, but got ${actualRes}`;
        expectFn(actualRes, msgNotMatchingError).toBe(expectedMessage);
        console.log(`==> Error message "${actualRes}" is as expected.`);
    }

    /**
     * To validate that the response body matches the expected schema.
     * @param response - The response to validate
     * @param schema - The schema to validate
     * @param options - Optional configuration for the validator
     */
    static validateSchema(response: ApiResponse, schema: any, options: ValidatorOptions = {}) {
        const expectFn = this.getExpect(options.soft);
        const body = response.body;
        const ajv = new Ajv();
        const validate = ajv.compile(schema);
        const valid = validate(body);
        const msg = `Response body does not match the expected schema: ${JSON.stringify(validate.errors)}`;
        expectFn(valid, msg).toBe(true);
        console.log(`==> Response body matches the expected schema.`);
    }

    /**
     * To validate that the array at the specified path in the response body has no duplicate objects based on a unique key (e.g., "id").
     * @param response - The response to validate
     * @param path - The path to the field relative to the response body. Supports dot notation and array indices (e.g. "user.address[0].street").
     * @param options - Optional configuration for the validator
     */
    static validateArrayHasNoDuplicateObjects(response: ApiResponse, path: string, options: ValidatorOptions = {}) {
        const expectFn = this.getExpect(options.soft);
        const actualArray = this.getActualValueByPath(response, path);
        const msgNotArray = `Expected field '${path}' to be an array, but got ${typeof actualArray}`;
        expectFn(Array.isArray(actualArray), msgNotArray).toBe(true);
        const msgHasDuplicates = `Expected array at field '${path}' to have no duplicate objects.`;
        expectFn(getDuplicateByKey(actualArray, "id").length, msgHasDuplicates).toBe(0);
        console.log(`==> Array at field '${path}' has no duplicate objects as expected.`);
    }

    /**
     * To validate that the object at the specified path in the response body matches the expected object.
     * @param response - The response to validate
     * @param path - The path to the field relative to the response body. Supports dot notation and array indices (e.g. "user.address[0].street").
     * @param expectedObject - The expected object
     * @param options - Optional configuration for the validator
     */
    static validateObjectContains(response: ApiResponse, path: string, expectedObject: Record<string, unknown>, options: ValidatorOptions = {}) {
        const expectFn = this.getExpect(options.soft);
        const actualObject = this.getActualValueByPath(response, path);
        const msgObjectNotContains = `Expected object with path '${path}' matches the expected object.`;
        expectFn(actualObject, msgObjectNotContains).toMatchObject(expectedObject);
        console.log(`==> Object ${JSON.stringify(actualObject)} matches the expected object ${JSON.stringify(expectedObject)} as expected.`);
    }

    /**
     * To retrieve the actual value of a field in the response body based on the specified path, and validate that the field is defined.
     * @param response - The response to validate
     * @param path - The path to the field relative to the response body. Supports dot notation and array indices (e.g. "user.address[0].street").
     * @param options - Optional configuration for the validator
     * @returns 
     */
    private static getActualValueByPath(response: ApiResponse, path: string) {
        const body = response.body;
        if (typeof body !== "object" || body == null) throw new Error(`Response body is not an object has field '${path}'`); 
        const actualValue = getValueFieldByPath(body, path);
        const msgUndefined = `Expected field '${path}' to be defined`;
        expect(actualValue, msgUndefined).not.toBeUndefined();
        return actualValue;
    }
}



