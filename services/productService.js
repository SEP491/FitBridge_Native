import { request } from "./request";

const productService = {
    searchProducts: async (queryParams = {}) => {
        // Pass queryParams as the params argument (5th parameter)
        return request("GET", "v1/products/search", null, {}, queryParams);
    },

    getProductDetails: async (productId) => {
        return request("GET", `v1/products/detail/${productId}`);
    },

    // Get Brand List
    getBrandList: async (queryParams = {}) => {
        return request("GET", "v1/brands", null, {}, queryParams);
    },

    //get Main Categories
    getMainCategories: async () => {
        return request("GET", "v1/categories");
    },

    //get Sub Categories by Main Category ID
    getSubCategories: async () => {
        return request("GET", `v1/categories/sub-categories`);
    },
};

export default productService;