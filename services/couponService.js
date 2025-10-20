import { request } from "./request";

const couponService = {
  getCoupons: (params) => request("GET", "v1/coupons", null, {}, params),
  createCoupons: (data) => request("POST", "v1/coupons", data),
  updateCoupons: (id, data) => request("PUT", `v1/coupons/${id}`, data),
  deleteCoupons: (id) => request("DELETE", `v1/coupons/${id}`),
  applyVoucher: (data) => request("POST", "v1/coupons/apply", data),
};

export default couponService;
