import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import { request } from "./request";

const freelancePTPackageService = {
  getFreelancePTPackages: (params) => request("GET", "v1/freelance-ptpackages", null, {}, params),
  createFreelancePTPackage: (data) => request("POST", "v1/freelance-ptpackages", data),
  updateFreelancePTPackage: (id, data) => request("PUT", `v1/freelance-ptpackages/${id}`, data),
  deleteFreelancePTPackage: (id) => request("DELETE", `v1/freelance-ptpackages/${id}`),
  getFreelancePTPackageById: (id) => request("GET", `v1/freelance-ptpackages/${id}`),
};

export default freelancePTPackageService;
