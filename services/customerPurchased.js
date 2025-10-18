import { request } from "./request";

const customerPurchasedService = {

  getAllCustomerPurchasedPackageById: (customerId) =>
    request("GET", `v1/customer-purchased/customer/${customerId}`),

  getCurrentCustomerPurchasedPackage: () =>
    request("GET", "v1/customer-purchased/customer/current"),

};
export default customerPurchasedService;