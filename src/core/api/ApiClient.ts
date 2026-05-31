import { APIRequestContext, APIResponse } from "@playwright/test";

export type RequestOption = {
  Get: Parameters<APIRequestContext["get"]>[1];
  Post: Parameters<APIRequestContext["post"]>[1];
  Put: Parameters<APIRequestContext["put"]>[1];
  Delete: Parameters<APIRequestContext["delete"]>[1];
};

export interface ApiResponse {
  status: number;
  headers: Record<string, string>;
  body: unknown;
  raw: APIResponse;
};

export class ApiClient {
  constructor(private request: APIRequestContext, private baseUrl: string) {}

  /**
   * Handles the API response by extracting the status code, headers, and body.
   * @param response - The API response object returned by Playwright's APIRequestContext methods (get, post, put, delete).
   * @returns - An object containing the status code, headers, and body of the response. The body is parsed as JSON if the content type is application/json, otherwise it is returned as text.
   */
  async handleResponse(response: APIResponse) {
    const contentType = response.headers()["content-type"] ?? "";
    const text = await response.text();
    let body;
    if (contentType.includes("application/json")) {
      body = await response.json();
    } else {
      // Fallback for non-standard APIs that return JSON data without the correct content type header
      try {
        body = JSON.parse(text);
        console.log(
          `!! Warning: Response content type is not application/json, but the response body was successfully parsed as JSON.`
        );
      } catch (error) {
        body = text;
      }
    }

    const handledResponse = {
      status: response.status(),
      headers: response.headers(),
      body: body,
      raw: response,
    };

    console.log(`[HANDLED RESPONSE] \n${JSON.stringify({
      status: handledResponse.status,
      headers: handledResponse.headers,
      body: handledResponse.body,
    }, null, 2)}`);
    return handledResponse;
  }

  /**
   * To send a GET request to the specified API endpoint with optional parameters such as headers, query parameters, or request body.
   * @param endpoint - The API endpoint to send the request to, which will be appended to the base URL provided when creating an instance of ApiClient.
   * @param options - An optional object containing additional options for the request, such as headers, query parameters, or request body. The type of options is defined by the RequestOption type for the GET method.
   * @returns - The result of the API request, which is processed by the handleResponse method to extract the status code, headers, and body of the response.
   */
  async get(endpoint: string, options: RequestOption ["Get"] = {}) {
    console.log(`[GET] Sending request to: ${this.baseUrl + endpoint} with options: ${JSON.stringify(options, null, 2)}`);
    const response = await this.request.get(this.baseUrl + endpoint, options);
    return this.handleResponse(response);
  }

  /**
   * To send a POST request to the specified API endpoint with optional parameters such as headers, query parameters, or request body.
   * @param endpoint - The API endpoint to send the POST request to, which will be appended to the base URL provided when creating an instance of ApiClient.
   * @param options - An optional object containing additional options for the POST request, such as headers, query parameters, or request body. The type of options is defined by the RequestOption type for the POST method.
   * @returns - The result of the POST request, which is processed by the handleResponse method to extract the status code, headers, and body of the response.
   */
  async post(endpoint: string, options: RequestOption ["Post"] = {}) {
    console.log(`[POST] Sending request to: ${this.baseUrl + endpoint} with options: ${JSON.stringify(options, null, 2)}`);
    const response = await this.request.post(this.baseUrl + endpoint, options);
    return this.handleResponse(response);
  }

  /**
   * To send a PUT request to the specified API endpoint with optional parameters such as headers, query parameters, or request body.
   * @param endpoint - The API endpoint to send the PUT request to, which will be appended to the base URL provided when creating an instance of ApiClient.
   * @param options - An optional object containing additional options for the PUT request, such as headers, query parameters, or request body. The type of options is defined by the RequestOption type for the PUT method.
   * @returns - The result of the PUT request, which is processed by the handleResponse method to extract the status code, headers, and body of the response.
   */
  async put(endpoint: string, options: RequestOption ["Put"] = {}) {
    console.log(`[PUT] Sending request to: ${this.baseUrl + endpoint} with options: ${JSON.stringify(options, null, 2)}`);
    const response = await this.request.put(this.baseUrl + endpoint, options);
    return this.handleResponse(response);
  }

  /**
   * To send a DELETE request to the specified API endpoint with optional parameters such as headers, query parameters, or request body.
   * @param endpoint - The API endpoint to send the DELETE request to, which will be appended to the base URL provided when creating an instance of ApiClient.
   * @param options - An optional object containing additional options for the DELETE request, such as headers, query parameters, or request body. The type of options is defined by the RequestOption type for the DELETE method.
   * @returns - The result of the DELETE request, which is processed by the handleResponse method to extract the status code, headers, and body of the response.
   */
  async delete(endpoint: string, options: RequestOption ["Delete"] = {}) {
    console.log(`[DELETE] Sending request to: ${this.baseUrl + endpoint} with options: ${JSON.stringify(options, null, 2)}`);
    const response = await this.request.delete(
      this.baseUrl + endpoint,
      options
    );
    return this.handleResponse(response);
  }
}
