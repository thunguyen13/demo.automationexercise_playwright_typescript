import { ApiClient } from "@core/api/ApiClient";
import { AuthService, UserInfo } from "@services/AuthService";
import { test as base } from "@playwright/test";
import { DEFAULT_URL } from "@config/env.config";
import { buildUserData, generateUniqueEmailAndName } from "@utils/dataHelpers";
import { validAccInfo } from "@data/api/account";
import { BaseValidator } from "@core/api/BaseValidator";

export type CleanUpUser = {
  email: string | null;
  password: string | null ;
}
interface Fixtures {
  apiClient: ApiClient;
  authService: AuthService;
  trackUserForCleanup: (u: CleanUpUser) => void;
  createdUser: UserInfo;
  createUser: (u: UserInfo) => Promise<UserInfo>;
};

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

    console.log(`\n============================================================`);
    console.log(`[FIXTURE - AFTER EACH HOOK] Attempting to delete test user account.`);
    if (user.email != null && user.password != null) {
      const payload = {
        email: user.email,
        password: user.password,
      };
      const res = await authService.deleteAccount(payload);
      console.log(
        `[CLEAN UP] Aptempted to delete test user with email: ${user.email}. Response code in body: ${res.body.responseCode}.`
      );
    } else {
        console.log(
          "[CLEAN UP] No user information provided for cleanup. Skipping deletion."
        );
    }
  },
  createdUser: async ({createUser}, use, testInfo) => {
    console.log(`Worker index: ${testInfo.workerIndex}`);
    console.log(`============================================================\n`);
    
    const userInfo = buildUserData(validAccInfo, {
      overrides: generateUniqueEmailAndName(),
    }) as UserInfo;

    console.log(`[FIXTURE - BEFORE EACH HOOK] Creating test user account: ${userInfo.email}`);
    const createdUserInfo = await createUser(userInfo);

    await use(createdUserInfo);
  },
  createUser: async ({ authService, trackUserForCleanup }, use, testInfo) => {
    await use(async (userInfo: UserInfo) => {
      console.log(`[CREATING] Creating test user account: ${userInfo.email}`);
      const res = await authService.createAccount(userInfo);
      trackUserForCleanup({email: userInfo.email, password: userInfo.password});
      BaseValidator.validateFieldValue(res, "responseCode", 201);
      console.log(`[CREATED] Test user has been created with email: ${userInfo.email} and password: ${userInfo.password}. Response code: ${res.body.responseCode}`);
      console.log(`============================================================\n`);
      return userInfo;
    });
  }
});
