import { request } from "./request";

const packageService = {
  getPackagesGymCourse: (params) =>
    request(
      "GET",
      "v1/customer-purchased/customer-package/gym-course",
      null,
      {},
      params
    ),

  getPackagesFreelance: (params) =>
    request(
      "GET",
      "v1/customer-purchased/customer-package/freelance-pt",
      null,
      {},
      params
    ),

  extendPackage: (data) => request("POST", "v1/gym-courses/extend", data),
};

export default packageService;
