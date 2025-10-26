import { request } from "./request";

const cartService = {
  processCart: (data) => request("POST", "v1/payments/payment-link", data),
  // processCartNormal: (data) => request("POST", "v1/cart/gym-course", data),

  checkStatus: (params) => request("GET", `v1/cart/status`, null, {}, params),

  applyVoucher: (data) => request("POST", "v1/coupons/apply", data),
  getOrderItemsToExtend: (id) =>
    request("GET", `v1/orders/customer-purchased/${id}`),
};

export default cartService;
