import { request } from "./request";

const certificateService = {
  getCertificateForPT: (params) =>
    request("GET", `v1/certificates`, null, {}, params),

  createCertificate: (formData) => request("POST", "v1/certificates", formData),

  getCertificateMetadata: () => request("GET", `v1/certificates/metadata`),

  updateCertificateStatus: (certificateId, data) =>
    request("PUT", `v1/certificates/${certificateId}`, data),

  deleteCertificate: (certificateId) =>
    request("DELETE", `v1/certificates/${certificateId}`),
};

export default certificateService;
