import { request } from "./request";

const trainingResultsService = {
  getTrainingResultsByUserPurchasedId: (packageId) =>
    request("GET", `v1/training-results/analytics/${packageId}`),
};

export default trainingResultsService;