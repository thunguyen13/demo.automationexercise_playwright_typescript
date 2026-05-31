import { BaseValidator } from "@core/api/BaseValidator";
import { test } from "@fixtures/api/product";
import { getDataFromJsonFile } from "@utils/fileHandling";
import {
  allProductsListSchema,
  brandListSchema,
} from "src/models/product.schema";

const successCode = 200;

test.describe("Product List API", () => {
  test("Should retrieve all products", async ({ productService }) => {
    const response = await productService.getAllProducts();
    BaseValidator.verifyStatusCode(response, successCode);
    BaseValidator.verifySchema(response, allProductsListSchema);
    BaseValidator.verifyFieldValue(response, "responseCode", successCode);
    const productsLength = response.body.products.length;
    if (productsLength > 0) {
      const firstProduct = `products[0].{fields}`;
      BaseValidator.verifyFieldValueNotEmpty(
        response,
        firstProduct.replace("{fields}", "name")
      );
      BaseValidator.verifyFieldValueNotEmpty(
        response,
        firstProduct.replace("{fields}", "brand")
      );
      BaseValidator.verifyFieldValueNotEmpty(
        response,
        firstProduct.replace("{fields}", "category.usertype.usertype")
      );
      BaseValidator.verifyFieldValueNotEmpty(
        response,
        firstProduct.replace("{fields}", "category.category")
      );
      BaseValidator.verifyArrayHasNoDuplicateObjects(response, "products");
    }
  });

  test("Should retrieve not supported method error when using unsupported HTTP method: POST", async ({
    apiClient,
  }) => {
    const endpoint = "/productsList";
    const response = await apiClient.post(endpoint);
    BaseValidator.verifyStatusCode(response, successCode);
    BaseValidator.verifyFieldValue(response, "responseCode", 405);
    BaseValidator.verifyErrorResponse(
      response,
      "This request method is not supported."
    );
  });

  test("Should retrieve not supported method error when using unsupported HTTP method: PUT", async ({
    apiClient,
  }) => {
    const endpoint = "/productsList";
    const response = await apiClient.put(endpoint);
    BaseValidator.verifyStatusCode(response, successCode);
    BaseValidator.verifyFieldValue(response, "responseCode", 405);
    BaseValidator.verifyErrorResponse(
      response,
      "This request method is not supported."
    );
  });

  test("Should retrieve not supported method error when using unsupported HTTP method: DELETE", async ({
    apiClient,
  }) => {
    const endpoint = "/productsList";
    const response = await apiClient.delete(endpoint);
    BaseValidator.verifyStatusCode(response, successCode);
    BaseValidator.verifyFieldValue(response, "responseCode", 405);
    BaseValidator.verifyErrorResponse(
      response,
      "This request method is not supported."
    );
  });
});

test.describe("Brand List API", () => {
  test("Should retrieve all brands of products", async ({ productService }) => {
    const response = await productService.getAllBrands();
    BaseValidator.verifyStatusCode(response, successCode);
    BaseValidator.verifySchema(response, brandListSchema);
    BaseValidator.verifyFieldValue(response, "responseCode", successCode);
    const brandsLength = response.body.brands.length;
    if (brandsLength > 0) {
      const firstBrand = `brands[0].{fields}`;
      BaseValidator.verifyFieldValueNotEmpty(
        response,
        firstBrand.replace("{fields}", "brand")
      );
      BaseValidator.verifyArrayHasNoDuplicateObjects(response, "brands");
    }
  });

  test("Should retrieve not supported method error when using unsupported HTTP method: POST", async ({ apiClient }) => {
    const endpoint = "/brandsList";
    const response = await apiClient.post(endpoint);
    BaseValidator.verifyStatusCode(response, successCode);
    BaseValidator.verifyFieldValue(response, "responseCode", 405);
    BaseValidator.verifyErrorResponse(response, "This request method is not supported.");
  });

  test("Should retrieve not supported method error when using unsupported HTTP method: PUT", async ({ apiClient }) => {
    const endpoint = "/brandsList";
    const response = await apiClient.put(endpoint);
    BaseValidator.verifyStatusCode(response, successCode);
    BaseValidator.verifyFieldValue(response, "responseCode", 405);
    BaseValidator.verifyErrorResponse(response, "This request method is not supported.");
  });

  test("Should retrieve not supported method error when using unsupported HTTP method: DELETE", async ({ apiClient }) => {
    const endpoint = "/brandsList";
    const response = await apiClient.delete(endpoint);
    BaseValidator.verifyStatusCode(response, successCode);
    BaseValidator.verifyFieldValue(response, "responseCode", 405);
    BaseValidator.verifyErrorResponse(response, "This request method is not supported.");
  });
});

test.describe.only("Search Product API", () => {
  type SearchProductRecord = {
    keyword: string;
    hasResult: boolean;
  };
  const records = getDataFromJsonFile<SearchProductRecord>("api/searchProduct.json");
  for (const record of records) {
    test(`Should retrieve searched products by name "${record.keyword}"`, async ({ productService }) => {
      const response = await productService.postSearchProducts({ search_product: record.keyword });
      BaseValidator.verifyStatusCode(response, successCode);
      BaseValidator.verifyFieldValue(response, "responseCode", successCode);
      if (!record.hasResult) {
        BaseValidator.verifyFieldValueIsEmptyArray(response, "products");
      } else {
        const productsLength = response.body.products.length;
        console.log(`==> Number of products retrieved for search keyword "${record.keyword}": ${productsLength}`);
        BaseValidator.verifyFieldValueIsNonEmptyArray(response, "products");
        BaseValidator.verifyArrayHasNoDuplicateObjects(response, "products");
        for(let i = 0; i < productsLength; i++) {
          const expected = record.keyword;
          BaseValidator.verifyFieldValueContainsText(response, `products[${i}].name`, expected);
        }
      }
    });
  }

  test("Should retrieve all products when search product name is empty", async ({ apiClient }) => {
    const endpoint = "/searchProduct";
    const payloadData = {
      form: {
        search_product: ""
      }
    };
    const response = await apiClient.post(endpoint, payloadData);
    BaseValidator.verifyStatusCode(response, successCode);
    BaseValidator.verifyFieldValue(response, "responseCode", 200);
    BaseValidator.verifyFieldValueIsNonEmptyArray(response, "products");
    BaseValidator.verifyArrayHasNoDuplicateObjects(response, "products");
  });

  test("Should retrieve error when lacking search product name", async ({ apiClient }) => {
    const endpoint = "/searchProduct";
    const payloadData = {
      form: {}
    };
    const response = await apiClient.post(endpoint, payloadData);
    BaseValidator.verifyStatusCode(response, successCode);
    BaseValidator.verifyFieldValue(response, "responseCode", 400);
    BaseValidator.verifyErrorResponse(response, "Bad request, search_product parameter is missing in POST request.");
  });

  test("Should retrieve error when there is no payload data in the request body", async ({ apiClient }) => {
    const endpoint = "/searchProduct";
    const response = await apiClient.post(endpoint);
    BaseValidator.verifyStatusCode(response, successCode);
    BaseValidator.verifyFieldValue(response, "responseCode", 400);
    BaseValidator.verifyErrorResponse(response, "Bad request, search_product parameter is missing in POST request.");
  });

  test("Should retrieve error when there is unsupported HTTP method: GET", async ({ apiClient }) => {
    const endpoint = "/searchProduct";
    const payloadData = {
      form: {
        search_product: "a",
      }
    };    const response = await apiClient.get(endpoint, payloadData);
    BaseValidator.verifyStatusCode(response, successCode);
    BaseValidator.verifyFieldValue(response, "responseCode", 405);
    BaseValidator.verifyErrorResponse(response, "This request method is not supported.");
  });

  test("Should retrieve error when there is unsupported HTTP method: PUT", async ({ apiClient }) => {
    const endpoint = "/searchProduct";
    const payloadData = {
      form: {
        search_product: "a",
      }
    };    const response = await apiClient.put(endpoint, payloadData);
    BaseValidator.verifyStatusCode(response, successCode);
    BaseValidator.verifyFieldValue(response, "responseCode", 405);
    BaseValidator.verifyErrorResponse(response, "This request method is not supported.");
  });

  test("Should retrieve error when there is unsupported HTTP method: DELETE", async ({ apiClient }) => {
    const endpoint = "/searchProduct";
    const payloadData = {
      form: {
        search_product: "a",
      }
    };    const response = await apiClient.delete(endpoint, payloadData);
    BaseValidator.verifyStatusCode(response, successCode);
    BaseValidator.verifyFieldValue(response, "responseCode", 405);
    BaseValidator.verifyErrorResponse(response, "This request method is not supported.");
  });
});