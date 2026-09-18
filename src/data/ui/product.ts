import { BRANDS, CATEGORIES, MainCategory, SubCategory } from "@components/ListProduct"

type SearchCase = {
    keyword: string,
    hasResult: boolean,
    name: string,
}
type FilterCategoryCase = {
    mainCategory: MainCategory,
    subCategory: SubCategory,
    hasResult: boolean,
    name: string,
}
type FilterBrandCase = {
    brand: string,
    hasResult: boolean,
    name: string,
}

export const search: SearchCase[] = [
    { keyword: "", hasResult: true, name: "Empty string" },
    { keyword: " ", hasResult: true, name: "Only space" },
    { keyword: "a", hasResult: true, name: "Single character" },
    { keyword: "- pink", hasResult: true, name: "Special character" },
    { keyword: "TOP", hasResult: true, name: "Uppercase" },
    { keyword: "en top", hasResult: true, name: "Partial match" },
    { keyword: "!Top", hasResult: false, name: "Special character - Non-existing name" },
    { keyword: "  top", hasResult: false, name: "Multiple spaces - Non-existing name" },
]

export const filterCategory: FilterCategoryCase[] = [
    ...Object.entries(CATEGORIES).flatMap(([mainCategory, subCategory]) => {
        return subCategory.map((subCategory) => {
            return {
                mainCategory: mainCategory as MainCategory,
                subCategory: subCategory as SubCategory,
                hasResult: true,
                name: `${mainCategory} - ${subCategory}`,
            }
        })
    }),
    {
        mainCategory: "Women",
        subCategory: "Non-existing subcategory" as SubCategory,
        hasResult: false,
        name: "Non-existing subcategory",
    }
]

export const filterBrand: FilterBrandCase[] = [
    ...BRANDS.map((brand) => {
        return {
            brand: brand,
            hasResult: true,
            name: brand,
        }
    }),
    {
        brand: "Non-existing brand",
        hasResult: false,
        name: "Non-existing brand",
    }
]

export const productData = [
    {
        name: "Fancy Green Top",
        category: "Women > Tops",
        price: "Rs. 700",
        img_src: "/get_product_picture/8",
        brand: "Polo"
    },
    {
        name: "Colour Blocked Shirt – Sky Blue",
        category: "Kids > Tops & Shirts",
        price: "Rs. 849",
        img_src: "/get_product_picture/24",
        brand: "Allen Solly Junior"
    }
]
