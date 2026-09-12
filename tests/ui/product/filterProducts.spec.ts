import { filterBrand, filterCategory } from '../../../src/data/ui/product';
import { test } from "@fixtures/ui/auth";
import { ProductDetailsPage } from "@pages/ProductDetailsPage";
import { ProductPage } from "@pages/ProductPage";
import { getRandomIndexList } from '@utils/helpers';


test.describe("Filter Products By Category", () => {
    for (const testCase of filterCategory) {
        test(testCase.name, async ({ page }) => {
            const productPage = new ProductPage(page);
            const listProduct = productPage.listProduct;
            const producDetailsPage = new ProductDetailsPage(page);
            const expectedHeader = `${testCase.mainCategory} - ${testCase.subCategory} Products`;
            const expectedCategoryText = `Category: ${testCase.mainCategory} > ${testCase.subCategory}`;

            await productPage.navigateTo();
            await listProduct.filterByCategory(testCase.mainCategory, testCase.subCategory);
            await listProduct.verifyHeaderText(expectedHeader);
            
            const productCardCount = await listProduct.getProductCardCount();
            const loopCount = productCardCount > 3 ? 3 : productCardCount;
            const randomIndexes = getRandomIndexList(loopCount, loopCount);
            for (const index of randomIndexes) {
                await test.step(`Verifying product category for product at index ${index} is ${expectedCategoryText}`, async () => {
                    await listProduct.clickViewProductButton({index: index});
                    await producDetailsPage.verifyProductDetails({category: expectedCategoryText});
                    await producDetailsPage.goBack();
                });
            }
        })
    }    
}); 

test.describe("Filter Products By Brand", () => {
    for (const testCase of filterBrand) {
        test(testCase.name, async ({ page }) => {
            const productPage = new ProductPage(page);
            const listProduct = productPage.listProduct;
            const producDetailsPage = new ProductDetailsPage(page);
            const expectedHeader = `Brand - ${testCase.brand} Products`;
            const expectedBrandText = `Brand: ${testCase.brand}`;

            await productPage.navigateTo();
            await listProduct.filterByBrand(testCase.brand);
            await listProduct.verifyHeaderText(expectedHeader);
            
            const productCardCount = await listProduct.getProductCardCount();
            const loopCount = productCardCount > 3 ? 3 : productCardCount;
            const randomIndexes = getRandomIndexList(loopCount, loopCount);
            for (const index of randomIndexes) {
                await test.step(`Verifying product brand for product at index ${index} is ${expectedBrandText}`, async () => {
                    await listProduct.clickViewProductButton({index: index});
                    await producDetailsPage.verifyProductDetails({brand: expectedBrandText});
                    await producDetailsPage.goBack();
                })
            }
        });
    }
});

