import { BaseValidator } from "@core/api/BaseValidator";
import { test } from "@fixtures/api/account";
import { UserIdentity, UserInfo } from "@services/AuthService";
import { validAccInfo, failureGetUserDetailData } from "@data/api/accountData";
import { userDetailSchema } from "src/models/account.schema";

const endpoint = "/getUserDetailByEmail";
const testUser: UserInfo = validAccInfo;
const successCode = 200;
const defaultErrorCode = 404;
const defaultErrorMsg = "Account not found with this email, try another email!";
const unsupportedMethodCode = 405;
const unsupportedMethodMsg = "This request method is not supported.";

test.describe.configure({ "mode": "parallel" });

test.beforeAll(async ({ authService }, testInfo) => {
    console.log(`[Before all hook] Creating test user. Worker index: ${testInfo.workerIndex}`);
    await authService.createAccount(testUser);
    console.log(`[Created] Test user has been created with email: ${testUser.email} and password: ${testUser.password}`);
});

test.describe("Success Get User Detail By Email API", () => {
    test("Should get user detail by email successfully",async ({ authService }) => {
        const email = testUser.email;
        const userDetail: Partial<UserInfo>= { ...testUser };
        delete userDetail.password;
        console.log(`Testing get user detail by email: ${email}`);
        const response = await authService.getUserDetailByEmail({ email });
        BaseValidator.verifyStatusCode(response, successCode);
        BaseValidator.verifySchema(response, userDetailSchema);
        BaseValidator.verifyFieldValue(response, "responseCode", successCode);
        BaseValidator.verifyObjectContains(response, "user", userDetail);
    });
});

test.describe("Failed Get User Detail By Email API", () => {
    for (const data of failureGetUserDetailData) {
        test(`Should failed and retrieve error message for: ${data.case}`, async ({ apiClient }) => {
            const payloadData = {
                params: data.payloadData
            };
            console.log(`Testing getUserDetail with payload: ${JSON.stringify(payloadData.params)}`);
            const response = await apiClient.get(endpoint, payloadData);
            BaseValidator.verifyStatusCode(response, successCode);
            BaseValidator.verifyFieldValue(response, "responseCode", data.code || defaultErrorCode);
            BaseValidator.verifyErrorResponse(response, data.message || defaultErrorMsg);
        });
    }
});

test.describe("Verify API Get User Detail retrieves error message for unsupported HTTP method", () => {
    const payloadData = {
        params: {
            email: testUser.email
        }
    };
    test("Should retrieve error message for unsupported HTTP method: POST", async ({ apiClient }) => {
        console.log(`Testing getUserDetail with unsupported HTTP method: POST and payload: ${JSON.stringify(payloadData.params)}`);
        const response = await apiClient.post(endpoint, payloadData);
        BaseValidator.verifyStatusCode(response, successCode);
        BaseValidator.verifyFieldValue(response, "responseCode", unsupportedMethodCode);
        BaseValidator.verifyErrorResponse(response, unsupportedMethodMsg);
    });
    test("Should retrieve error message for unsupported HTTP method: PUT", async ({ apiClient }) => {
        console.log(`Testing getUserDetail with unsupported HTTP method: PUT and payload: ${JSON.stringify(payloadData.params)}`);
        const response = await apiClient.put(endpoint, payloadData);
        BaseValidator.verifyStatusCode(response, successCode);
        BaseValidator.verifyFieldValue(response, "responseCode", unsupportedMethodCode);
        BaseValidator.verifyErrorResponse(response, unsupportedMethodMsg);
    });
    test("Should retrieve error message for unsupported HTTP method: DELETE", async ({ apiClient }) => {
        console.log(`Testing getUserDetail with unsupported HTTP method: DELETE and payload: ${JSON.stringify(payloadData.params)}`);
        const response = await apiClient.delete(endpoint, payloadData);
        BaseValidator.verifyStatusCode(response, successCode);
        BaseValidator.verifyFieldValue(response, "responseCode", unsupportedMethodCode);
        BaseValidator.verifyErrorResponse(response, unsupportedMethodMsg);
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