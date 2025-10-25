import { request } from "./request";

const packageService = {
  getPackages: (params) =>
    request("GET", "v1/customer-purchased/customer-package", null, {}, params),

  extendPackage: (data) => request("POST", "v1/gym-courses/extend", data),
};

export default packageService;
