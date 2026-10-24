import { BaseValidator } from "@core/api/BaseValidator";
import { CleanUpUser, test } from "@fixtures/api/account";
import { getValueFieldByPath } from "@utils/helpers";
import { duplicateEmailRegisterData, invalidRegisterData, missingFieldRegisterData, validRegisterData } from "@data/api/account";
import { ApiResponse } from "@core/api/ApiClient";


const successCode = 200;
const endpoint = "/createAccount";
const successCreatedCode = 201;
const successMsg = "User created!";
const badRequestCode = 400;
const unsupportedMethodCode = 405;
const unsupportedMethodMsg = `Method \"{method}\" not allowed.`;

test.describe('Register Success', () => {
    for (const data of validRegisterData) {
        test(`Should register successfully with: ${data.case}`, async ({ authService, trackUserForCleanup }) => {
            console.log(`Testing registration API with payload data: ${JSON.stringify(data.payloadData)}`);
            const response = await authService.createAccount(data.payloadData);
            // Register for cleanup
            trackUserForCleanup({
                email: data.payloadData.email!,
                password: data.payloadData.password!,
            });
            BaseValidator.validateStatusCode(response, successCode);
            BaseValidator.validateFieldValue(response, "responseCode", successCreatedCode);
            BaseValidator.validateFieldValue(response, "message", successMsg);
        });
    };
});

test.describe('Register Failure - Bad Request: Missing/Invalid Field', () => {
    for (const data of missingFieldRegisterData) {
        test(`Should fail to register with: ${data.case}`, async ({ authService, trackUserForCleanup }) => {
            const errorMsg = data.message || "Bad request, missing required fields in POST request.";
            console.log(`Testing registration API with payload data: ${JSON.stringify(data.payloadData)}`);
            const response = await authService.createAccount(data.payloadData);
            // Check if account was created and register for cleanup
            trackUserForCleanUpIfCreated(
                response, 
                {
                    email: data.payloadData.email!,
                    password: data.payloadData.password!,
                }, 
                trackUserForCleanup
            );
            BaseValidator.validateStatusCode(response, successCode);
            BaseValidator.validateFieldValue(response, "responseCode", badRequestCode);
            BaseValidator.validateErrorResponse(response, errorMsg);
        });
    };
    for (const data of invalidRegisterData) {
        test(`Should fail to register with: ${data.case}`, async ({ authService, trackUserForCleanup }) => {
            const errorMsg = data.message || "Bad request, invalid field format.";
            console.log(`Testing registration API with payload data: ${JSON.stringify(data.payloadData)}`);
            const response = await authService.createAccount(data.payloadData);
            // Check if account was created and register for cleanup
            trackUserForCleanUpIfCreated(
                response, 
                {
                    email: data.payloadData.email!,
                    password: data.payloadData.password!,
                }, 
                trackUserForCleanup
            );
            BaseValidator.validateStatusCode(response, successCode);
            BaseValidator.validateFieldValue(response, "responseCode", badRequestCode);
            BaseValidator.validateErrorResponse(response, errorMsg); 
        });
    };
});

test.describe('Register Failure - Bad Request: Duplicate Email', () => {
    const payloadData = duplicateEmailRegisterData.payloadData;
    test.beforeEach(async ({ authService, trackUserForCleanup }) => {
        console.log(`[BEFORE EACH HOOK] Creating test user.`);
        const response = await authService.createAccount(payloadData);
        trackUserForCleanup({
            email: payloadData.email!,
            password: payloadData.password!,
        });
        BaseValidator.validateFieldValue(response, "responseCode", successCreatedCode);
        console.log(`[SETUP] Created test user with email: ${payloadData.email} for duplicate email registration test.`);
    });
    test(`Should fail to register with: ${duplicateEmailRegisterData.case}`, async ({ authService }) => {
        const errorMsg = duplicateEmailRegisterData.message || "Bad request, email already exists.";
        console.log(`Testing registration API with duplicate email payload data: ${JSON.stringify(payloadData)}`);
        const response = await authService.createAccount(payloadData);
        BaseValidator.validateStatusCode(response, successCode);
        BaseValidator.validateFieldValue(response, "responseCode", badRequestCode);
        BaseValidator.validateErrorResponse(response, errorMsg);
    });
});

test.describe('Register Unsupported HTTP Method', () => {
    const payloadData = {
        form: validRegisterData[0].payloadData
    }
    const userAccount = {
        email: validRegisterData[0].payloadData.email!,
        password: validRegisterData[0].payloadData.password!,
    }
    test(`Should fail to register with unsupported HTTP method: GET`, async ({ apiClient, trackUserForCleanup }) => {
        console.log(`Testing registration API with unsupported HTTP method: GET and payload data: ${JSON.stringify(payloadData.form)}`);
        const response = await apiClient.get(endpoint, payloadData);
        trackUserForCleanUpIfCreated(
            response, 
            userAccount, 
            trackUserForCleanup
        );
        BaseValidator.validateStatusCode(response, unsupportedMethodCode);
        BaseValidator.validateFieldValue(response, "detail", unsupportedMethodMsg.replace("{method}", "GET"));
    });
    test(`Should fail to register with unsupported HTTP method: PUT`, async ({ apiClient, trackUserForCleanup }) => {
        console.log(`Testing registration API with unsupported HTTP method: GET and payload data: ${JSON.stringify(payloadData.form)}`);
        const response = await apiClient.put(endpoint, payloadData);
        trackUserForCleanUpIfCreated(
            response, 
            userAccount, 
            trackUserForCleanup
        );
        BaseValidator.validateStatusCode(response, unsupportedMethodCode);
        BaseValidator.validateFieldValue(response, "detail", unsupportedMethodMsg.replace("{method}", "PUT"));
    });
    test(`Should fail to register with unsupported HTTP method: DELETE`, async ({ apiClient, trackUserForCleanup }) => {
        console.log(`Testing registration API with unsupported HTTP method: GET and payload data: ${JSON.stringify(payloadData.form)}`);
        const response = await apiClient.delete(endpoint, payloadData);
        trackUserForCleanUpIfCreated(
            response, 
            userAccount, 
            trackUserForCleanup
        );
        BaseValidator.validateStatusCode(response, unsupportedMethodCode);
        BaseValidator.validateFieldValue(response, "detail", unsupportedMethodMsg.replace("{method}", "DELETE"));
    })
});

function trackUserForCleanUpIfCreated(response: ApiResponse, account: { email: string, password: string }, trackUserForCleanup: (u: CleanUpUser) => void) {
    if (response.body == null) {
        throw new Error("[UNEXPECTED] Response body is null. Cannot determine if account was created. Email: " + account.email);
    }
    const responseCode = getValueFieldByPath(response.body, "responseCode");
    if (responseCode !== successCreatedCode) {
        console.log(`[EXPECTED] Registration failed as expected. No account to clean up for email: ${account.email}.`);
        return;
    }
    console.log(`[UNEXPECTED] Registration succeeded. Add account to the cleanup queue by email: ${account.email}.`);
    trackUserForCleanup({
        email: account.email,
        password: account.password,
    });
}