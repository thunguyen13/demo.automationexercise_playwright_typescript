import { test as base } from '@playwright/test';
import { ApiClient } from '@core/api/ApiClient';
import { ProductService } from 'src/services/ProductService';
import { DEFAULT_URL } from '@config/env.config';

interface Fixtures {
    apiClient: ApiClient;
    productService: ProductService;
};

export const test = base.extend<Fixtures>({
    apiClient: async({ request }, use) => {
        const baseUrl = DEFAULT_URL.API_URL;
        const client = new ApiClient(request, baseUrl);
        await use(client);
    },
    productService: async({ apiClient }, use) => {
        const service = new ProductService(apiClient);
        await use(service);
    }
});

export { expect } from '@playwright/test';


