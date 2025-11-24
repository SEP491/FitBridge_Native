import { request } from "./request";

const addressService = {
    getAllAddresses: (params) =>
        request("GET", "v1/addresses/customer", null, {}, params),
    getAddressDetail: (addressId) =>
        request("GET", `v1/addresses/${addressId}`),
    createAddress: (data) =>
        request("POST", "v1/addresses", data),
    updateAddress: (addressId, data) =>
        request("PUT", `v1/addresses/${addressId}`, data),

};

export default addressService;