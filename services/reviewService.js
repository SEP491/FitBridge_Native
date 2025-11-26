import { request } from "./request";

const reviewService = {
    createReview: (formData) => 
        request("POST", "v1/reviews", formData, {
      "Content-Type": "multipart/form-data",
    }),
};

export default reviewService;