import { request } from "./request";

const orderService = {
    placeOrder: (data) =>
        request("POST", "v1/orders", data),
    orderShippingPriceEstimate: (addressId) =>
        request("POST", "v1/orders/shipping/price-estimate", addressId),
    getProductOrder: (params) =>
        request("GET", "v1/orders/product",null,{}, params  ),
    cancelOrder: (orderId, data) =>
        request("PUT", `v1/orders/status/${orderId}`, data, {}, ),
    confirmOrderReceived: (orderId) =>
        request("PUT", `v1/orders/status/${orderId}`, { status: "Finished", description: "Order received by customer successfully" }, {}, ),
    markOrderNotReceived: (orderId, description) =>
        request("PUT", `v1/orders/status/${orderId}`, { status: "CustomerNotReceived", description: description }, {}, ),
};

export default orderService;