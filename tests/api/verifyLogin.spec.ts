import { BaseValidator } from "@core/api/BaseValidator";
import { test } from "@fixtures/api/account";
import { UserIdentity, UserInfo } from "@services/AuthService";
import { validAccInfo, badRequestData, notFoundData } from "@data/api/accountData";

const endpoint = "/verifyLogin";
const testUser: UserInfo = validAccInfo;
const successMsg = "User exists!";
const successCode = 200;
const badRequestCode = 400;
const badRequestMsg = "Bad request, email or password parameter is missing in POST request.";
const notFoundCode = 404;
const notFoundMsg = "User not found!";
const unsupportedMethodCode = 405;
const unsupportedMethodMsg = "This request method is not supported.";

test.describe.configure({ "mode": "parallel" });

test.beforeAll(async ({ authService }, testInfo) => {
    console.log(`[Before all hook] Creating test user. Worker index: ${testInfo.workerIndex}`);
    const res = await authService.createAccount(testUser);
    console.log(`[Created] Test user has been created with email: ${testUser.email} and password: ${testUser.password}. Response code: ${res.body.responseCode}`);
});

test.describe("Verify Success Login API", () => {
    test("Should Verify login success with valid credentials",async ({ authService }) => {
        const userIdentity: UserIdentity = {
            email: testUser.email,
            password: testUser.password
        };
        console.log(`Testing login with valid credentials: email: ${userIdentity.email} and password: ${userIdentity.password}`);
        const response = await authService.verifyLogin(userIdentity);
        BaseValidator.validateStatusCode(response, successCode);
        BaseValidator.validateFieldValue(response, "responseCode", successCode);
        BaseValidator.validateFieldValue(response, "message", successMsg);
    });
});

test.describe("Verify Failed Login API", () => {
    for (const data of badRequestData) {
        test(`Should retrieve error message for missing field(s): ${data.case}`, async ({ apiClient }) => {
            const payloadData = {
                form: data.payloadData
            };
            console.log(`Testing login with payload: ${JSON.stringify(payloadData.form)}`);
            const response = await apiClient.post(endpoint, payloadData);
            BaseValidator.validateStatusCode(response, successCode);
            BaseValidator.validateFieldValue(response, "responseCode", badRequestCode);
            BaseValidator.validateErrorResponse(response, badRequestMsg);
        });
    }
    for (const data of notFoundData) {
        test(`Should retrieve error message for invalid credentials: ${data.case}`, async ({ apiClient }) => {
            const payloadData = {
                form: data.payloadData
            };
            console.log(`Testing login with payload: ${JSON.stringify(payloadData.form)}`);
            const response = await apiClient.post(endpoint, payloadData);
            BaseValidator.validateStatusCode(response, successCode);
            BaseValidator.validateFieldValue(response, "responseCode", notFoundCode);
            BaseValidator.validateErrorResponse(response, notFoundMsg);
        });
    }
});

test.describe("Verify API Login retrieves error message for unsupported HTTP method", () => {
    const payloadData = {
        form: {
            email: testUser.email,
            password: testUser.password
        }
    }
    test("Should retrieve error message for unsupported HTTP method: GET", async ({ apiClient }) => {
        console.log(`Testing login with unsupported HTTP method: GET and payload: ${JSON.stringify(payloadData.form)}`);
        const response = await apiClient.get(endpoint, payloadData);
        BaseValidator.validateStatusCode(response, successCode);
        BaseValidator.validateFieldValue(response, "responseCode", unsupportedMethodCode);
        BaseValidator.validateErrorResponse(response, unsupportedMethodMsg);
    });
    test("Should retrieve error message for unsupported HTTP method: PUT", async ({ apiClient }) => {
        console.log(`Testing login with unsupported HTTP method: PUT and payload: ${JSON.stringify(payloadData.form)}`);
        const response = await apiClient.put(endpoint, payloadData);
        BaseValidator.validateStatusCode(response, successCode);
        BaseValidator.validateFieldValue(response, "responseCode", unsupportedMethodCode);
        BaseValidator.validateErrorResponse(response, unsupportedMethodMsg);
    });
    test("Should retrieve error message for unsupported HTTP method: DELETE", async ({ apiClient }) => {
        console.log(`Testing login with unsupported HTTP method: DELETE and payload: ${JSON.stringify(payloadData.form)}`);
        const response = await apiClient.delete(endpoint, payloadData);
        BaseValidator.validateStatusCode(response, successCode);
        BaseValidator.validateFieldValue(response, "responseCode", unsupportedMethodCode);
        BaseValidator.validateErrorResponse(response, unsupportedMethodMsg);
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