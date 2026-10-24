import { BaseValidator } from "@core/api/BaseValidator";
import { test } from "@fixtures/api/account";
import { UserIdentity, UserInfo } from "@services/AuthService";
import { validAccInfo, badRequestData, notFoundData } from "@data/api/account";

const endpoint = "/deleteAccount";
const testUser: UserInfo = validAccInfo;
const successMsg = "Account deleted!";
const successCode = 200;
const badRequestCode = 400;
const defaultBadRequestMsg =
  "Bad request, email or password parameter is missing in DELETE request.";
const notFoundCode = 404;
const notFoundMsg = "Account not found!";
const unsupportedMethodCode = 405;
const unsupportedMethodMsg = `Method \"{method}\" not allowed.`;

test.describe.configure({ mode: "parallel" });

test.beforeEach(async ({ authService, trackUserForCleanup }, testInfo) => {
  console.log(`[BEFORE EACH HOOK] Creating test user. Worker index: ${testInfo.workerIndex}`);
  const res = await authService.createAccount(testUser);
  trackUserForCleanup({email: testUser.email, password: testUser.password});
  BaseValidator.validateFieldValue(res, "responseCode", 201);
  console.log(`[CREATED] Test user has been created with email: ${testUser.email} and password: ${testUser.password}`);
});

test.describe("Success Delete API", () => {
  test.only("Should Verify delete success with valid credentials", async ({authService}) => {
    const userIdentity: UserIdentity = {
      email: testUser.email,
      password: testUser.password,
    };
    console.log(`TESTING DELETE with valid credentials: email: ${userIdentity.email} and password: ${userIdentity.password}`);
    const response = await authService.deleteAccount(userIdentity);
    BaseValidator.validateStatusCode(response, successCode);
    BaseValidator.validateFieldValue(response, "responseCode", successCode);
    BaseValidator.validateFieldValue(response, "message", successMsg);
  });
});

test.describe("Failed Delete API", () => {
  for (const data of badRequestData) {
    test(`Should retrieve error message for missing field(s): ${data.case}`, async ({apiClient}) => {
      const payloadData = {
        form: data.payloadData,
      };
      console.log(`TESTING DELETE with payload: ${JSON.stringify(payloadData.form)}`);
      const response = await apiClient.delete(endpoint, payloadData);
      const badRequestMsg = data.message?.replace("{method}", "DELETE") || defaultBadRequestMsg;
      BaseValidator.validateStatusCode(response, successCode);
      BaseValidator.validateFieldValue(response, "responseCode", badRequestCode);
      BaseValidator.validateErrorResponse(response, badRequestMsg);
    });
  }
  for (const data of notFoundData) {
    test(`Should retrieve error message for invalid credentials: ${data.case}`, async ({apiClient}) => {
      const payloadData = {
        form: data.payloadData,
      };
      console.log(`TESTING DELETE with payload: ${JSON.stringify(payloadData.form)}`);
      const response = await apiClient.delete(endpoint, payloadData);
      BaseValidator.validateStatusCode(response, successCode);
      BaseValidator.validateFieldValue(response, "responseCode", notFoundCode);
      BaseValidator.validateErrorResponse(response, notFoundMsg);
    });
  }
});

test.describe("Verify API delete retrieves error message for unsupported HTTP method", () => {
  const payloadData = {
    form: {
      email: testUser.email,
      password: testUser.password,
    },
  };
  test("Should retrieve error message for unsupported HTTP method: GET", async ({apiClient}) => {
    console.log(`TESTING DELETE ACCOUNT with unsupported HTTP method: GET and payload: ${JSON.stringify(payloadData.form)}`);
    const response = await apiClient.get(endpoint, payloadData);
    BaseValidator.validateStatusCode(response, unsupportedMethodCode);
    BaseValidator.validateFieldValue(response, "detail", unsupportedMethodMsg.replace("{method}", "GET"));
  });
  test("Should retrieve error message for unsupported HTTP method: PUT", async ({apiClient}) => {
    console.log(`TESTING DELETE ACCOUNT with unsupported HTTP method: PUT and payload: ${JSON.stringify(payloadData.form)}`);
    const response = await apiClient.put(endpoint, payloadData);
    BaseValidator.validateStatusCode(response, unsupportedMethodCode);
    BaseValidator.validateFieldValue(response, "detail", unsupportedMethodMsg.replace("{method}", "PUT"));});
  test("Should retrieve error message for unsupported HTTP method: POST", async ({apiClient}) => {
    console.log(`TESTING DELETE ACCOUNT with unsupported HTTP method: POST and payload: ${JSON.stringify(payloadData.form)}`);
    const response = await apiClient.post(endpoint, payloadData);
    BaseValidator.validateStatusCode(response, unsupportedMethodCode);
    BaseValidator.validateFieldValue(response, "detail", unsupportedMethodMsg.replace("{method}", "POST")
    );
  });
});
