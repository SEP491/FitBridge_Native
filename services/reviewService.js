import { request } from "./request";

const reviewService = {
    createReview: (formData) => 
        request("PUT", "v1/reviews", formData, {
      "Content-Type": "multipart/form-data",
    }),
};

export default reviewService;