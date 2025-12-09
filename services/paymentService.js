import { request } from "./request";

const paymentService = {
  updatePaymentCancel: (data) => request("POST", "v1/payments/cancel", data),

  sendRequestWithdrawal: (data) => request("POST", "v1/payments/request-withdrawal", data),
  getRequestWithdrawal: () => request("GET", "v1/payments/withdrawal-requests"),

  confirmWithdrawal: (withdrawalRequestId) => request("PUT", `v1/payments/withdrawal-requests/${withdrawalRequestId}/confirm`),

  repaidOrder: (data) => request("POST", "v1/payments/re-paid-order", data),
};

export default paymentService;
