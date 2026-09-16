import { filterBrand, filterCategory, productData } from "@data/ui/product";
import { test } from "@fixtures/ui/common";
import { CartPage, CartProduct } from "@pages/CartPage";
import { HomePage } from "@pages/HomePage";
import { ProductDetailsPage } from "@pages/ProductDetailsPage";
import { ProductPage } from "@pages/ProductPage";
import { getRandomIndexList, getRandomInt } from '@utils/helpers';


test.describe("Add product to cart", () => {
    test("Verify add product to cart from home page", async ({ page }) => {
        const homePage = new HomePage(page);
        const listProduct = homePage.listProduct;
        const cartModal = listProduct.cartModal;
        const cartPage = new CartPage(page);

        await homePage.navigateTo();
        const productCardCount = await listProduct.getProductCardCount();
        const randomIndex = getRandomInt(0, productCardCount - 1);
        const productInfo = await listProduct.getProductCardInfo({index: randomIndex});
        const addedProduct: CartProduct[] = [
            {
                ...productInfo,
                quantity: 1
            }
        ]
        await listProduct.clickAddToCartButton({index: randomIndex});
        await cartModal.clickViewCart();
        await cartPage.verifyProductsInCart(addedProduct);
    });

    test("Verify add product to cart from product page", async ({ page }) => {
        const productPage = new ProductPage(page);
        const listProduct = productPage.listProduct;
        const productDetailsPage = new ProductDetailsPage(page);
        const cartModal = productDetailsPage.cartModal;
        const cartPage = new CartPage(page);

        await productPage.navigateTo();
        const productCardCount = await listProduct.getProductCardCount();
        const randomIndex = getRandomInt(0, productCardCount - 1);
        const productInfo = await listProduct.getProductCardInfo({index: randomIndex});
        const addedProduct: CartProduct[] = [
            {
                ...productInfo,
                quantity: 1
            }
        ]
        await listProduct.clickAddToCartButton({index: randomIndex});
        await cartModal.clickViewCart();
        await productPage.header.clickMenuItem("cart");
        await cartPage.verifyProductsInCart(addedProduct);
    });

    test("Verify add product to cart from product details page", async ({ page }) => {
        const productPage = new ProductPage(page);
        const listProduct = productPage.listProduct;
        const productDetailsPage = new ProductDetailsPage(page);
        const cartModal = productDetailsPage.cartModal;
        const cartPage = new CartPage(page);

        await productPage.navigateTo();
        const productCardCount = await listProduct.getProductCardCount();
        const randomIndex = getRandomInt(0, productCardCount - 1);
        await listProduct.clickViewProductButton({index: randomIndex});
        const productDetails = await productDetailsPage.getProductDetails();
        const quantity = 2;
        const addedProduct: CartProduct[] = [
            {
                ...productDetails,
                quantity
            }
        ];
        await productDetailsPage.addProductToCart(quantity);
        await cartModal.clickViewCart();
        await cartPage.verifyProductsInCart(addedProduct);
    });

    test("Verify add product after search", async ({ page }) => {
        const productPage = new ProductPage(page);
        const listProduct = productPage.listProduct;
        const productDetailsPage = new ProductDetailsPage(page);
        const cartModal = productDetailsPage.cartModal;
        const cartPage = new CartPage(page);

        await productPage.navigateTo();
        const searchedKeyword = "white";
        await productPage.searchProduct(searchedKeyword);
        const productCardCount = await listProduct.getProductCardCount();
        const randomIndex = getRandomInt(0, productCardCount - 1);
        const productInfo = await listProduct.getProductCardInfo({index: randomIndex});
        const addedProduct: CartProduct[] = [
            {
                ...productInfo,
                quantity: 1
            }
        ];
        await listProduct.clickAddToCartButton({index: randomIndex});
        await cartModal.clickViewCart();
        await cartPage.verifyProductsInCart(addedProduct);
    });

    test("Verify add product after filter by category", async ({ page }) => {
        const productPage = new ProductPage(page);
        const listProduct = productPage.listProduct;
        const cartModal = listProduct.cartModal;
        const cartPage = new CartPage(page);

        await productPage.navigateTo();
        const randomIndexCategory = getRandomInt(0, filterCategory.length - 2);
        const mainCategory = filterCategory[randomIndexCategory].mainCategory;
        const subCategory = filterCategory[randomIndexCategory].subCategory;
        await listProduct.filterByCategory(mainCategory, subCategory);
        const productCardCount = await listProduct.getProductCardCount();
        const randomIndex = getRandomInt(0, productCardCount - 1);
        const productInfo = await listProduct.getProductCardInfo({index: randomIndex});
        const addedProduct: CartProduct[] = [
            {
                ...productInfo,
                category: `${mainCategory} > ${subCategory}`,
                quantity: 1
            }
        ];
        await listProduct.clickAddToCartButton({index: randomIndex});
        await cartModal.clickContinueShopping();
        await productPage.header.clickMenuItem("cart");
        await cartPage.verifyProductsInCart(addedProduct);
    });

    test("Verify add product after filter by brand", async ({ page }) => {
        const productPage = new ProductPage(page);
        const listProduct = productPage.listProduct;
        const cartModal = listProduct.cartModal;
        const cartPage = new CartPage(page);

        await productPage.navigateTo();
        const randomIndexBrand = getRandomInt(0, filterBrand.length - 2);
        const brand = filterBrand[randomIndexBrand].brand;
        await listProduct.filterByBrand(brand);
        const productCardCount = await listProduct.getProductCardCount();
        const randomIndex = getRandomInt(0, productCardCount - 1);
        const productInfo = await listProduct.getProductCardInfo({index: randomIndex});
        const addedProduct: CartProduct[] = [
            {
                ...productInfo,
                quantity: 1
            }
        ];
        await listProduct.clickAddToCartButton({index: randomIndex});
        await cartModal.clickContinueShopping();
        await productPage.header.clickMenuItem("cart");
        await cartPage.verifyProductsInCart(addedProduct);
    });
}); 

test.describe("Add multiple products to cart", () => {
    test("Verify add multiple products to cart from product page", async ({ page }) => {
        const productPage = new ProductPage(page);
        const listProduct = productPage.listProduct;
        const productDetailsPage = new ProductDetailsPage(page);
        const cartModal = productDetailsPage.cartModal;
        const cartPage = new CartPage(page);

        await productPage.navigateTo();
        for (const product of productData) {
            await listProduct.clickAddToCartButton({name: product.name});
            await cartModal.clickContinueShopping();
        }
        const productInfo = productData.map((product) => {
                return {
                        ...product,
                        quantity: 1
                    }
                });
        await productPage.header.clickMenuItem("cart");
        await cartPage.verifyProductsInCart(productInfo);
    });

    test("Verify add multiple products to cart from product details page", async ({ page }) => {
        const productPage = new ProductPage(page);
        const listProduct = productPage.listProduct;
        const productDetailsPage = new ProductDetailsPage(page);
        const cartModal = productDetailsPage.cartModal;
        const cartPage = new CartPage(page);

        await productPage.navigateTo();
        const productCardCount = await listProduct.getProductCardCount();
        const randomIndexes = getRandomIndexList(productCardCount, 2);
        const productInfo = [];
        for (const index of randomIndexes) {
            await listProduct.clickViewProductButton({index});
            const productDetails = await productDetailsPage.getProductDetails();
            const quantity = getRandomInt(1, 5);
            productInfo.push({
                ...productDetails,
                quantity
            });
            await productDetailsPage.addProductToCart(quantity);
            await cartModal.clickContinueShopping();
            await productDetailsPage.goBack();
        }
        await productPage.header.clickMenuItem("cart");
        await cartPage.verifyProductsInCart(productInfo);
    });
});

