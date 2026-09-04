import { BaseVerification, VerificationOptions } from "@core/ui/BaseVerification";
import { Locator, Page } from "@playwright/test";
import { step } from "@utils/logger";

export type CardIdentifier = { index: number, name?: never } | { index?: never, name: string };
export type CardInfo = {
    imageSrc: string | null;
    price: string;
    name: string;
}
export type CardOverlayInfo = {
    price: string;
    name: string;
}

export const CATEGORIES = {
    Women: ["Dress", "Tops", "Saree"],
    Men: ["Tshirts", "Jeans"],
    Kids: ["Dress", "Tops & Shirts"],
} as const;
export type MainCategory = keyof typeof CATEGORIES;
export type SubCategory = (typeof CATEGORIES)[keyof typeof CATEGORIES][number];

export const BRANDS = ["Polo", "H&M", "Madame", "Mast & Harbour", "Babyhug", "Allen Solly Junior", "Kookie Kids", "Biba"] as const;
export type BrandName = (typeof BRANDS)[number];

export class ListProduct {
    constructor(private page: Page) {}

    /* ** SELECTORS ** */
    private readonly headerList = this.page.locator('div[class*="features_items"] h2[class*="title"]');
    private readonly listProducts = this.page.locator('.features_items .product-image-wrapper');
    private readonly productCard = {
        image: (parent?: Locator) => (parent ?? this.page).locator('div[class*="productinfo"] > img'),
        price: (parent?: Locator) => (parent ?? this.page).locator('div[class*="productinfo"] > h2'),
        name: (parent?: Locator) => (parent ?? this.page).locator('div[class*="productinfo"] > p'),
        addToCartButton: (parent?: Locator) => (parent ?? this.page).locator('div[class*="productinfo"]').getByRole('button', { name: 'Add to cart' }),
        viewProductButton: (parent?: Locator) => (parent ?? this.page).getByRole('link', { name: 'View Product' }),
    }
    private readonly productCardOverlay = {
        price: (parent?: Locator) => (parent ?? this.page).locator('div[class*="product-overlay"] h2'),
        name: (parent?: Locator) => (parent ?? this.page).locator('div[class*="product-overlay"] p'),
        addToCartButton: (parent?: Locator) => (parent ?? this.page).locator('div[class*="product-overlay"]').getByRole('button', { name: 'Add to cart' }),
    }
    private readonly search = {
        input: this.page.locator('#search_product'),
        button: this.page.locator('#submit_search'),
    }
    private readonly filter = {
        mainCategory: (mainCategory: MainCategory) => this.page.locator(`a[href="#${mainCategory}"]`),
        subCategory: (mainCategory: MainCategory, subCategory: SubCategory) => this.page.locator(`div[id="${mainCategory}"]`).getByRole('link', { name: new RegExp(`^\\s*${subCategory}\\s*$`, 'i') }),
        brand: (brand: BrandName) => this.page.locator('div[class="brands-name"]').getByRole('link', { name: brand }),
    }

    /* ** CONSTANTS ** */
    public readonly HEADER = {
        ALL: "All Products",
        SEARCHED: "Searched Products",
        FILTERED: "{mainCategory} - {subCategory} Products",
    }


    /* ** ACTION METHODS ** */
    getProductCard(identifier: CardIdentifier): Locator {
        if (identifier.index !== undefined) {
            return this.listProducts.nth(identifier.index);
        }

        const {name} = identifier;
        const nameRegex = new RegExp(`^${name}$`, 'i');
        const matchingName = this.productCard.name().filter({ hasText: nameRegex });
        return this.listProducts.filter({ has: matchingName });
    }

    @step("Clicking the 'Add to cart' button for the product card with '{0}'")
    async clickAddToCartButton(identifier: CardIdentifier) {
        const card = this.getProductCard(identifier);
        await this.productCard.addToCartButton(card).click();
    }

    @step("Clicking the 'View Product' button for the product card with '{0}'")
    async clickViewProductButton(identifier: CardIdentifier) {
        const card = this.getProductCard(identifier);
        await this.productCard.viewProductButton(card).click();
    }

    @step("Hovering over the product card with '{0}'")
    async hoverAndGetOverlayContent(identifier: CardIdentifier): Promise<CardOverlayInfo> {
        const card = this.getProductCard(identifier);
        await card.hover();
        const price = await this.productCardOverlay.price(card).innerText();
        const name = await this.productCardOverlay.name(card).innerText();
        return { price, name };
    }

    @step("Getting the info of the product card with '{0}'")
    async getProductCardInfo(identifier: CardIdentifier): Promise<CardInfo> {
        const card = this.getProductCard(identifier);
        const imageSrc = await this.productCard.image(card).getAttribute('src');
        const price = await this.productCard.price(card).innerText();
        const name = await this.productCard.name(card).innerText();
        return { imageSrc, price, name };
    }

    @step("Getting the count of product cards displayed on the page")
    async getProductCardCount() {
        const count = await this.listProducts.count();
        return count;
    }

    @step("Getting the info of all product cards displayed on the page")
    async getAllProductCardInfo(): Promise<CardInfo[]> {
        const count = await this.getProductCardCount();
        const productInfoList: CardInfo[] = [];
        for (let i = 0; i < count; i++) {
            const cardInfo = await this.getProductCardInfo({ index: i });
            productInfoList.push(cardInfo);
        }
        return productInfoList;
    }
    
    @step("Filtering by main category '{0}' and subcategory '{1}'")
    async filterByCategory(mainCategory: string, subCategory: string) {
        const categories = CATEGORIES as Record<string, readonly string[]>;
        if (!categories[mainCategory]) {
            throw new Error(`Invalid main category: ${mainCategory}. Valid categories: ${Object.keys(categories).join(', ')}`);
        }
        if (!categories[mainCategory].includes(subCategory)) {
            throw new Error(`Invalid subcategory: ${subCategory} for main category: ${mainCategory}. Valid subcategories: ${categories[mainCategory].join(', ')}`);
        }
        await this.filter.mainCategory(mainCategory as MainCategory).click();
        await this.filter.subCategory(mainCategory as MainCategory, subCategory as SubCategory).click();
    }

    @step("Filtering by brand '{0}'")
    async filterByBrand(brand: string) {
        const brands = BRANDS as readonly string[];
        if (!brands.includes(brand)) {
            throw new Error(`Invalid brand: ${brand}. Valid brands: ${brands.join(', ')}`);
        }
        await this.filter.brand(brand as BrandName).click();
    }

    /* ** VERIFICATION METHODS ** */

    @step("Verifying the header text is '{0}'")
    async verifyHeaderText(expectedHeader: string, options: VerificationOptions = {}) {
        console.log(`Verifying header text is '${expectedHeader}'`);
        await BaseVerification.verifyText(this.headerList, expectedHeader, options);
    }

    @step("Verifying the product card info with '{0}' matches the overlay content with '{1}'")
    async verifyProductMatch(cardData: CardInfo, overlayData: CardOverlayInfo, options: VerificationOptions = {}) {
        const expectFn = BaseVerification.getExpect(options.soft);
        const errorNameMsg = `Expected product name on card "${cardData.name}" to match overlay "${overlayData.name}"`;
        await BaseVerification.expectWithLog(() => expectFn(cardData.name, errorNameMsg).toEqual(overlayData.name), errorNameMsg);
        const errorPriceMsg = `Expected product price on card "${cardData.price}" to match overlay "${overlayData.price}"`;
        await BaseVerification.expectWithLog(() => expectFn(cardData.price, errorPriceMsg).toEqual(overlayData.price), errorPriceMsg);
    }

}