import { BaseValidator } from "@core/api/BaseValidator";
import { test } from "@fixtures/api/account";
import { UserIdentity, UserInfo } from "@services/AuthService";
import { validAccInfo, successUpdateData, badRequestUpdateData, notFoundUpdateData, invalidUpdateData } from "@data/api/accountData";

const endpoint = "/updateAccount";
const testUser: UserInfo = validAccInfo;
const successMsg = "User updated!";
const successCode = 200;
const badRequestCode = 400;
const badRequestMsg = "Bad request, email or password parameter is missing in PUT request.";
const invalidDataMsg = "Bad request."
const notFoundCode = 404;
const notFoundMsg = "User not found!";
const unsupportedMethodCode = 405;
const unsupportedMethodMsg = `Method \"{method}\" not allowed.`;

test.beforeAll(async ({ authService }, testInfo) => {
    console.log(`[Before all hook] Creating test user. Worker index: ${testInfo.workerIndex}`);
    await authService.createAccount(testUser);
    console.log(`[Created] Test user has been created with email: ${testUser.email} and password: ${testUser.password}`);
});

test.describe("Verify Success Update API", () => {
    for (const data of successUpdateData) {
        test(`Should verify update success with: ${data.case}`,async ({ authService }) => {
            const updateData = data.payloadData;
            console.log(`Testing update with payload: ${JSON.stringify(updateData)}`);
            const response = await authService.updateAccount(updateData);
            BaseValidator.verifyStatusCode(response, successCode);
            BaseValidator.verifyFieldValue(response, "responseCode", successCode);
            BaseValidator.verifyFieldValue(response, "message", successMsg);
        });
    }
});

test.describe("Verify Failed Update API", () => {
    for (const data of badRequestUpdateData) {
        test(`Should retrieve error message for missing field(s): ${data.case}`, async ({ apiClient }) => {
            const payloadData = {
                form: data.payloadData
            };
            console.log(`Testing update with payload: ${JSON.stringify(payloadData.form)}`);
            const response = await apiClient.put(endpoint, payloadData);
            BaseValidator.verifyStatusCode(response, successCode);
            BaseValidator.verifyFieldValue(response, "responseCode", data.code || badRequestCode);
            BaseValidator.verifyErrorResponse(response, data.message || badRequestMsg);
        });
    }
    for (const data of notFoundUpdateData) {
        test(`Should retrieve error message for invalid credentials: ${data.case}`, async ({ apiClient }) => {
            const payloadData = {
                form: data.payloadData
            };
            console.log(`Testing update with payload: ${JSON.stringify(payloadData.form)}`);
            const response = await apiClient.put(endpoint, payloadData);
            BaseValidator.verifyStatusCode(response, successCode);
            BaseValidator.verifyFieldValue(response, "responseCode", data.code || notFoundCode);
            BaseValidator.verifyErrorResponse(response, data.message || notFoundMsg);
        });
    }
    for (const data of invalidUpdateData) {
        test(`Should retrieve error message for data: ${data.case}`, async ({ apiClient }) => {
            const payloadData = {
                form: data.payloadData
            };
            console.log(`Testing update with payload: ${JSON.stringify(payloadData.form)}`);
            const response = await apiClient.put(endpoint, payloadData);
            BaseValidator.verifyStatusCode(response, successCode);
            BaseValidator.verifyFieldValue(response, "responseCode", data.code || badRequestCode);
            BaseValidator.verifyErrorResponse(response, data.message || invalidDataMsg);
        });
    }
});

test.describe("Verify API Update retrieves error message for unsupported HTTP method", () => {
    const payloadData = {
        form: {
            email: testUser.email,
            password: testUser.password,
            name: testUser.name + "update"
        }
    }
    test("Should retrieve error message for unsupported HTTP method: GET", async ({ apiClient }) => {
        console.log(`Testing update with unsupported HTTP method: GET and payload: ${JSON.stringify(payloadData.form)}`);
        const response = await apiClient.get(endpoint, payloadData);
        BaseValidator.verifyStatusCode(response, unsupportedMethodCode);
        BaseValidator.verifyFieldValue(response, "detail", unsupportedMethodMsg.replace("{method}", "GET"));
    });
    test("Should retrieve error message for unsupported HTTP method: POST", async ({ apiClient }) => {
        console.log(`Testing update with unsupported HTTP method: POST and payload: ${JSON.stringify(payloadData.form)}`);
        const response = await apiClient.post(endpoint, payloadData);
        BaseValidator.verifyStatusCode(response, unsupportedMethodCode);
        BaseValidator.verifyFieldValue(response, "detail", unsupportedMethodMsg.replace("{method}", "POST"));
    });
    test("Should retrieve error message for unsupported HTTP method: DELETE", async ({ apiClient }) => {
        console.log(`Testing update with unsupported HTTP method: DELETE and payload: ${JSON.stringify(payloadData.form)}`);
        const response = await apiClient.delete(endpoint, payloadData);
        BaseValidator.verifyStatusCode(response, unsupportedMethodCode);
        BaseValidator.verifyFieldValue(response, "detail", unsupportedMethodMsg.replace("{method}", "DELETE"));
    });
});

test.afterAll(async ({ authService }) => {
    console.log(`[After all hook] Deleting test user.`);
    const userIdentity: UserIdentity = {
        email: testUser.email,
        password: testUser.password
    }
    const res = await authService.deleteAccount(userIdentity);
    console.log(`[Clean up] Test user with email: ${testUser.email} has been deleted. Response code: ${res.body.responseCode}`);
});