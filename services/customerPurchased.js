import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import { request } from "./request";

const customerPurchasedService = {

  getAllCustomerPurchasedPackageById: (customerId) =>
    request("GET", `v1/customer-purchased/customer/${customerId}`),

  getCurrentCustomerPurchasedPackage: () =>
    request("GET", "v1/customer-purchased/customer/current"),

  getCustomerPurchasedPackageResult: (customerPurchasedId) =>
    request("GET", `v1/customer-purchased/result/${customerPurchasedId}`),

  getCustomerPurchasedMuscleReport: (customerPurchasedId) =>
    request("GET", `v1/customer-purchased/result/${customerPurchasedId}/detail`),

  getCustomerPurchasedPackageTransaction: (customerPurchasedId) =>
    request("GET", `v1/customer-purchased/${customerPurchasedId}/transactions`),
};
export default customerPurchasedService;