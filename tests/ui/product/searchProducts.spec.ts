import { search } from './../../../src/data/ui/product';
import { test } from "@fixtures/ui/auth";
import { ProductDetailsPage } from "@pages/ProductDetailsPage";
import { ProductPage } from "@pages/ProductPage";


test.describe("Search Products", () => {
    for (const testCase of search) {
        test(testCase.name, async ({ page }) => {
            const productPage = new ProductPage(page);
            const header = testCase.keyword.trim() ? productPage.listProduct.HEADER.SEARCHED : productPage.listProduct.HEADER.ALL;

            await productPage.navigateTo();
            await productPage.searchProduct(testCase.keyword);
            await productPage.listProduct.verifyHeaderText(header);
            await productPage.verifySearchResults(testCase.keyword, testCase.hasResult, {soft: true});
        })
    }    
}); 
