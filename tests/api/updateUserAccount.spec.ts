import { BaseValidator } from "@core/api/BaseValidator";
import { test } from "@fixtures/api/account";
import { UserInfo } from "@services/AuthService";
import { validAccInfo, successUpdateData, badRequestUpdateData, notFoundUpdateData, invalidUpdateData } from "@data/api/account";

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

test.beforeAll(async ({ createUser }, testInfo) => {
    console.log(`[BEFORE ALL HOOK] Creating test user. Worker index: ${testInfo.workerIndex}`);
    await createUser(testUser);
});

test.beforeEach(async ({}, testInfo) => {
    console.log(`[DATA TEST] Worker index: ${testInfo.workerIndex}. Created user: ${JSON.stringify(testUser)}`);
    console.log(`============================================================\n`);
})

test.describe("Verify Success Update API", () => {
    for (const data of successUpdateData) {
        test(`Should Verify update success with: ${data.case}`,async ({ authService }) => {
            const updateData = data.payloadData;
            console.log(`TESTING UPDATE ACCOUNT with payload: ${JSON.stringify(updateData)}`);
            const response = await authService.updateAccount(updateData);
            BaseValidator.validateStatusCode(response, successCode);
            BaseValidator.validateFieldValue(response, "responseCode", successCode);
            BaseValidator.validateFieldValue(response, "message", successMsg);
        });
    }
});

test.describe("Verify Failed Update API", () => {
    for (const data of badRequestUpdateData) {
        test(`Should retrieve error message for missing field(s): ${data.case}`, async ({ apiClient }) => {
            const payloadData = {
                form: data.payloadData
            };
            console.log(`TESTING UPDATE ACCOUNT with payload: ${JSON.stringify(payloadData.form)}`);
            const response = await apiClient.put(endpoint, payloadData);
            BaseValidator.validateStatusCode(response, successCode);
            BaseValidator.validateFieldValue(response, "responseCode", data.code || badRequestCode);
            BaseValidator.validateErrorResponse(response, data.message || badRequestMsg);
        });
    }
    for (const data of notFoundUpdateData) {
        test(`Should retrieve error message for invalid credentials: ${data.case}`, async ({ apiClient }) => {
            const payloadData = {
                form: data.payloadData
            };
            console.log(`TESTING UPDATE ACCOUNT with payload: ${JSON.stringify(payloadData.form)}`);
            const response = await apiClient.put(endpoint, payloadData);
            BaseValidator.validateStatusCode(response, successCode);
            BaseValidator.validateFieldValue(response, "responseCode", data.code || notFoundCode);
            BaseValidator.validateErrorResponse(response, data.message || notFoundMsg);
        });
    }
    for (const data of invalidUpdateData) {
        test(`Should retrieve error message for data: ${data.case}`, async ({ apiClient }) => {
            const payloadData = {
                form: data.payloadData
            };
            console.log(`TESTING UPDATE ACCOUNT with payload: ${JSON.stringify(payloadData.form)}`);
            const response = await apiClient.put(endpoint, payloadData);
            BaseValidator.validateStatusCode(response, successCode);
            BaseValidator.validateFieldValue(response, "responseCode", data.code || badRequestCode);
            BaseValidator.validateErrorResponse(response, data.message || invalidDataMsg);
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
        console.log(`TESTING UPDATE ACCOUNT with unsupported HTTP method: GET and payload: ${JSON.stringify(payloadData.form)}`);
        const response = await apiClient.get(endpoint, payloadData);
        BaseValidator.validateStatusCode(response, unsupportedMethodCode);
        BaseValidator.validateFieldValue(response, "detail", unsupportedMethodMsg.replace("{method}", "GET"));
    });
    test("Should retrieve error message for unsupported HTTP method: POST", async ({ apiClient }) => {
        console.log(`TESTING UPDATE ACCOUNT with unsupported HTTP method: POST and payload: ${JSON.stringify(payloadData.form)}`);
        const response = await apiClient.post(endpoint, payloadData);
        BaseValidator.validateStatusCode(response, unsupportedMethodCode);
        BaseValidator.validateFieldValue(response, "detail", unsupportedMethodMsg.replace("{method}", "POST"));
    });
    test("Should retrieve error message for unsupported HTTP method: DELETE", async ({ apiClient }) => {
        console.log(`TESTING UPDATE ACCOUNT with unsupported HTTP method: DELETE and payload: ${JSON.stringify(payloadData.form)}`);
        const response = await apiClient.delete(endpoint, payloadData);
        BaseValidator.validateStatusCode(response, unsupportedMethodCode);
        BaseValidator.validateFieldValue(response, "detail", unsupportedMethodMsg.replace("{method}", "DELETE"));
    });
});

test.afterAll(async ({ trackUserForCleanup }) => {
    console.log(`\n============================================================`);
    console.log(`[AFTER ALL HOOK] Deleting test user.`);
    trackUserForCleanup({ email: testUser.email, password: testUser.password });
});