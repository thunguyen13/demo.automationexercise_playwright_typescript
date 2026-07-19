import { ApiClient } from "@core/api/ApiClient";
import { AuthService } from "@services/AuthService";
import { test as base } from "@playwright/test";
import { ENV } from "@config/env.config";

export type CleanUpUser = {
  email: string | null;
  password: string | null ;
}
interface Fixtures {
  apiClient: ApiClient;
  authService: AuthService;
  trackUserForCleanup: (u: CleanUpUser) => Promise<void>;
};

export const test = base.extend<Fixtures>({
  apiClient: async ({ request }, use) => {
    const baseUrl = ENV.API_URL;
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

    console.log(`Worker index: ${testInfo.workerIndex}`);

    await use(async (u: CleanUpUser) => {
      user = u;
    });

    console.log(`[Fixture - After each hook] Attempting to delete test user.`);
    if (user.email != null && user.password != null) {
      const payload = {
        email: user.email,
        password: user.password,
      };
      const res = await authService.deleteAccount(payload);
      console.log(
        `[Clean up] Aptempted to delete test user with email: ${user.email}. Response code: ${res.body.responseCode}.`
      );
    } else {
        console.log(
          "[Clean up] No user information provided for cleanup. Skipping deletion."
        );
    }
  }
});
