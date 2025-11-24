import { request } from "./request";

const orderService = {
    placeOrder: (data) =>
        request("POST", "v1/orders", data),
    orderShippingPriceEstimate: (addressId) =>
        request("POST", "v1/orders/shipping/price-estimate", addressId),
    getProductOrder: (params) =>
        request("GET", "v1/orders/product",null,{}, params  ),
};

export default orderService;