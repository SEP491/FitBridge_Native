import { request } from "./request";

const BodyMeasurementsService = {
    getBodyMeasurements: (customerPurchasedId) =>
        request("GET", `v1/body-measurements/${customerPurchasedId}`),
    createBodyMeasurements: (data) =>
        request("POST", "v1/body-measurements", data),
    updateBodyMeasurements: (id, data) =>
        request("PUT", `v1/body-measurements/${customerPurchasedId}`, data),
};

export default BodyMeasurementsService;
