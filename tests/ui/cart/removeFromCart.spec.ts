import { test } from "@fixtures/ui/common";
import { CartPage, CartProduct } from "@pages/CartPage";
import { ProductDetailsPage } from "@pages/ProductDetailsPage";
import { ProductPage } from "@pages/ProductPage";
import { getRandomIndexList, getRandomInt } from '@utils/helpers';

test("Should remove the only product from cart", async ({ page }) => {
    const productPage = new ProductPage(page);
    const listProduct = productPage.listProduct;
    const cartModal = listProduct.cartModal;
    const cartPage = new CartPage(page);

    await productPage.navigateTo();
    const productCardCount = await listProduct.getProductCardCount();
    const randomIndex = getRandomInt(0, productCardCount - 1);
    const productInfo = await listProduct.getProductCardInfo({ index: randomIndex });
    const addedProduct: CartProduct[] = [
        {
            ...productInfo,
            quantity: 1
        }
    ]
    await listProduct.clickAddToCartButton({ index: randomIndex });
    await cartModal.clickViewCart();
    await cartPage.deleteProducts(addedProduct);
    await cartPage.verifyCartIsEmpty();
});

test("Should remove a product and keep other products", async ({ page }) => {
    const productPage = new ProductPage(page);
    const listProduct = productPage.listProduct;
    const cartModal = listProduct.cartModal;
    const cartPage = new CartPage(page);

    await productPage.navigateTo();
    const productCardCount = await listProduct.getProductCardCount();
    const randomIndexes = getRandomIndexList(productCardCount, 3);
    const addedProduct: CartProduct[] = [];
    for (const index of randomIndexes) {
        const productInfo = await listProduct.getProductCardInfo({ index });
        addedProduct.push({
            ...productInfo,
            quantity: 1
        });
        await listProduct.clickAddToCartButton({ index });
        await cartModal.clickContinueShopping();
    }
    await productPage.header.clickMenuItem("cart");
    await cartPage.deleteProducts([addedProduct[1]]);
    await cartPage.verifyProductsInCart([addedProduct[0], addedProduct[2]]);
    await cartPage.deleteProducts([addedProduct[0]]);
    await cartPage.verifyProductsInCart([addedProduct[2]]);
});

test("Should remove product with multiple quantities", async ({ page }) => {
    const productPage = new ProductPage(page);
    const listProduct = productPage.listProduct;
    const productDetailsPage = new ProductDetailsPage(page);
    const cartModal = productDetailsPage.cartModal;
    const cartPage = new CartPage(page);

    await productPage.navigateTo();
    const productCardCount = await listProduct.getProductCardCount();
    const randomIndex = getRandomInt(0, productCardCount - 1);
    const productInfo = await listProduct.getProductCardInfo({ index: randomIndex });
    const addedProduct: CartProduct[] = [
        {
            ...productInfo,
            quantity: 2
        }
    ];
    await listProduct.clickAddToCartButton({ index: randomIndex });
    await cartModal.clickViewCart();
    await cartPage.deleteProducts(addedProduct);
    await cartPage.verifyCartIsEmpty();
});

test("Should remove all products", async ({ page }) => {
    const productPage = new ProductPage(page);
    const listProduct = productPage.listProduct;
    const productDetailsPage = new ProductDetailsPage(page);
    const cartModal = productDetailsPage.cartModal;
    const cartPage = new CartPage(page);

    await productPage.navigateTo();
    const productCardCount = await listProduct.getProductCardCount();
    const randomIndexes = getRandomIndexList(productCardCount, 2);
    const addedProduct: CartProduct[] = [];
    for (const index of randomIndexes) {
        const productInfo = await listProduct.getProductCardInfo({ index });
        addedProduct.push({
            ...productInfo,
            quantity: getRandomInt(2, 4)
        });
        await listProduct.clickAddToCartButton({ index });
        await cartModal.clickContinueShopping();
    }
    await productPage.header.clickMenuItem("cart");
    await cartPage.deleteProducts(addedProduct);
    await cartPage.verifyCartIsEmpty();
})
