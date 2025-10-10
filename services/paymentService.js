import { request } from "./request";

const paymentService = {
  updatePaymentCancel: (data) => request("POST", "v1/payments/cancel", data),
};

export default paymentService;
