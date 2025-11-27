import { request } from "./request";

const contractService = {
  getContractById: (contractId) =>
    request(
      "GET",
      "/v1/contracts",
      null,
      {},
      { contractId, page: 1, size: 20 }
    ),

  getContractForCustomer: (customerId) =>
    request(
      "GET",
      "/v1/contracts",
      null,
      {},
      { customerId, page: 1, size: 20 }
    ),

  updateContract: (formData) => request("PUT", "/v1/contracts", formData),
};

export default contractService;
