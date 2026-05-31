import { BaseValidator } from "@core/api/BaseValidator";
import { CleanUpUser, test } from "@fixtures/api/account";
import { getValueFieldByPath } from "@utils/helpers";
import { duplicateEmailRegisterData, invalidRegisterData, missingFieldRegisterData, validRegisterData } from "@data/api/accountData";
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
            await trackUserForCleanup({
                email: data.payloadData.email!,
                password: data.payloadData.password!,
            });
            BaseValidator.verifyStatusCode(response, successCode);
            BaseValidator.verifyFieldValue(response, "responseCode", successCreatedCode);
            BaseValidator.verifyFieldValue(response, "message", successMsg);
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
            await trackUserForCleanUpIfCreated(
                response, 
                {
                    email: data.payloadData.email!,
                    password: data.payloadData.password!,
                }, 
                trackUserForCleanup
            );
            BaseValidator.verifyStatusCode(response, successCode);
            BaseValidator.verifyFieldValue(response, "responseCode", badRequestCode);
            BaseValidator.verifyErrorResponse(response, errorMsg);
        });
    };
    for (const data of invalidRegisterData) {
        test(`Should fail to register with: ${data.case}`, async ({ authService, trackUserForCleanup }) => {
            const errorMsg = data.message || "Bad request, invalid field format.";
            console.log(`Testing registration API with payload data: ${JSON.stringify(data.payloadData)}`);
            const response = await authService.createAccount(data.payloadData);
            // Check if account was created and register for cleanup
            await trackUserForCleanUpIfCreated(
                response, 
                {
                    email: data.payloadData.email!,
                    password: data.payloadData.password!,
                }, 
                trackUserForCleanup
            );
            BaseValidator.verifyStatusCode(response, successCode);
            BaseValidator.verifyFieldValue(response, "responseCode", badRequestCode);
            BaseValidator.verifyErrorResponse(response, errorMsg); 
        });
    };
});

test.describe('Register Failure - Bad Request: Duplicate Email', () => {
    const payloadData = duplicateEmailRegisterData.payloadData;
    test.beforeEach(async ({ authService, trackUserForCleanup }) => {
        console.log(`[Before each hook] Creating test user.`);
        const response = await authService.createAccount(payloadData);
        BaseValidator.verifyFieldValue(response, "responseCode", successCreatedCode);
        // Register for cleanup
        await trackUserForCleanup({
            email: payloadData.email!,
            password: payloadData.password!,
        });
        console.log(`[Setup] Created test user with email: ${payloadData.email} for duplicate email registration test.`);
    });
    test(`Should fail to register with: ${duplicateEmailRegisterData.case}`, async ({ authService, trackUserForCleanup }) => {
        const errorMsg = duplicateEmailRegisterData.message || "Bad request, email already exists.";
        console.log(`Testing registration API with duplicate email payload data: ${JSON.stringify(payloadData)}`);
        const response = await authService.createAccount(payloadData);
        BaseValidator.verifyStatusCode(response, successCode);
        BaseValidator.verifyFieldValue(response, "responseCode", badRequestCode);
        BaseValidator.verifyErrorResponse(response, errorMsg);
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
        await trackUserForCleanUpIfCreated(
            response, 
            userAccount, 
            trackUserForCleanup
        );
        BaseValidator.verifyStatusCode(response, unsupportedMethodCode);
        BaseValidator.verifyFieldValue(response, "detail", unsupportedMethodMsg.replace("{method}", "GET"));
    });
    test(`Should fail to register with unsupported HTTP method: PUT`, async ({ apiClient, trackUserForCleanup }) => {
        console.log(`Testing registration API with unsupported HTTP method: GET and payload data: ${JSON.stringify(payloadData.form)}`);
        const response = await apiClient.put(endpoint, payloadData);
        await trackUserForCleanUpIfCreated(
            response, 
            userAccount, 
            trackUserForCleanup
        );
        BaseValidator.verifyStatusCode(response, unsupportedMethodCode);
        BaseValidator.verifyFieldValue(response, "detail", unsupportedMethodMsg.replace("{method}", "PUT"));
    });
    test(`Should fail to register with unsupported HTTP method: DELETE`, async ({ apiClient, trackUserForCleanup }) => {
        console.log(`Testing registration API with unsupported HTTP method: GET and payload data: ${JSON.stringify(payloadData.form)}`);
        const response = await apiClient.delete(endpoint, payloadData);
        await trackUserForCleanUpIfCreated(
            response, 
            userAccount, 
            trackUserForCleanup
        );
        BaseValidator.verifyStatusCode(response, unsupportedMethodCode);
        BaseValidator.verifyFieldValue(response, "detail", unsupportedMethodMsg.replace("{method}", "DELETE"));
    })
});

async function trackUserForCleanUpIfCreated(response: ApiResponse, account: { email: string, password: string }, trackUserForCleanup: (u: CleanUpUser) => Promise<void>) {
    if (response.body == null)
        return;
    const responseCode = getValueFieldByPath(response.body, "responseCode");
    if (responseCode !== successCreatedCode)
        return;
    console.log(`[Unexpected Success] Registration succeeded. Add account to the cleanup queue by email: ${account.email}.`);
    await trackUserForCleanup({
        email: account.email,
        password: account.password,
    });
}