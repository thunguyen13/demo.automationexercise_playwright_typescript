import { ApiClient } from "@core/api/ApiClient";
import { AuthService, UserInfo } from "@services/AuthService";
import { test as base } from "@playwright/test";
import { DEFAULT_URL } from "@config/env.config";
import { buildUserData, generateUniqueEmailAndName } from "@utils/dataHelpers";
import { validAccInfo } from "@data/api/account";
import { BaseValidator } from "@core/api/BaseValidator";
import { logToFile } from "@utils/logger";
import path from "path";

export type CleanUpUser = {
  email: string | null;
  password: string | null ;
}
interface Fixtures {
  apiClient: ApiClient;
  authService: AuthService;
  trackUserForCleanup: (u: CleanUpUser) => void;
  createUser: (u: UserInfo) => Promise<UserInfo>;
  createdUser: UserInfo;
};

const outputDir = process.env.TEST_OUTPUT_DIR;

if (!outputDir) {
  throw new Error("TEST_OUTPUT_DIR is not defined.");
}
const logFilePath = path.join(outputDir, "logs", "account.txt");

export const test = base.extend<Fixtures>({
  apiClient: async ({ request }, use) => {
    const baseUrl = DEFAULT_URL.API_URL;
    const apiClient = new ApiClient(request, baseUrl);
    await use(apiClient);
  },
  authService: async ({ apiClient }, use) => {
    const authService = new AuthService(apiClient);
    await use(authService);
  },
  trackUserForCleanup: async ({ authService }, use, testInfo) => {
    let user: CleanUpUser = {
        email: null,
        password: null,
    };

    await use((u: CleanUpUser) => {
        user = u;
    });

    console.log(`\n5[CLEANING UP] Deleting test user account: ${user.email}`);

    if (user.email != null && user.password != null) {
      const payload = {
        email: user.email,
        password: user.password,
      };
      const res = await authService.deleteAccount(payload);
      console.log(
        `[CLEAN UP] Aptempted to delete test user with email: ${user.email}. Response code in body: ${res.body.responseCode}.`
      );
      const testFilePath = path.relative(process.cwd(), testInfo.file);
      await logToFile(testInfo.workerIndex, `[${testFilePath}] [CLEAN UP] [DELETE] | ${user.email} - ${user.password} | Response code: ${res.body.responseCode}`, logFilePath);
    } else {
        console.log(
          "[CLEAN UP] No user information provided for cleanup. Skipping deletion."
        );
    }
  },
  createdUser: async ({ createUser, trackUserForCleanup }, use, testInfo) => {
    console.log(`Worker index: ${testInfo.workerIndex}`);
    console.log(`============================================================\n`);
    
    const userInfo = buildUserData(validAccInfo, {
      overrides: generateUniqueEmailAndName(),
    }) as UserInfo;

    console.log(`[FIXTURE - BEFORE EACH HOOK] Creating test user account: ${userInfo.email}`);
    const createdUserInfo = await createUser(userInfo);
    trackUserForCleanup({ email: userInfo.email, password: userInfo.password });

    await use(createdUserInfo);

    console.log(`\n============================================================`);
    console.log(`[FIXTURE - AFTER EACH HOOK] Attempting to delete test user account.`);
  },
  createUser: async ({ authService }, use, testInfo) => {
    const testFilePath = path.relative(process.cwd(), testInfo.file);
    await use(async (userInfo: UserInfo) => {
      console.log(`[CREATING] Creating test user account: ${userInfo.email}`);
      const res = await authService.createAccount(userInfo);
      BaseValidator.validateFieldValue(res, "responseCode", 201);
      await logToFile(testInfo.workerIndex, `[${testFilePath}] [SETUP] [CREATE] | ${userInfo.email} - ${userInfo.password} | Response code: ${res.body.responseCode}`, logFilePath);
      console.log(`[CREATED] Test user has been created with email: ${userInfo.email} and password: ${userInfo.password}. Response code: ${res.body.responseCode}`);
      console.log(`============================================================\n`);
      return userInfo;
    });
  }
});
