import { request } from "./request";

const transactionService = {
  getTransactions: (params) =>
    request("GET", "v1/transactions/current-user", null, {}, params),
  getOrdersHistoryCustomer: (params) =>
    request("GET", "v1/orders/customer/history", null, {}, params),
};

export default transactionService;
