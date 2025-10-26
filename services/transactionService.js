import { request } from "./request";

const transactionService = {
  getTransactions: (params) =>
    request("GET", "v1/transactions/current-user", null, {}, params),
};

export default transactionService;
