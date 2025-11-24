import { request } from "./request";

const paymentService = {
  updatePaymentCancel: (data) => request("POST", "v1/payments/cancel", data),

  sendRequestWithdrawal: (data) => request("POST", "v1/payments/request-withdrawal", data),
  getRequestWithdrawal: () => request("GET", "v1/payments/withdrawal-requests"),

  repaidOrder: (data) => request("POST", "v1/payments/re-paid-order", data),
};

export default paymentService;
