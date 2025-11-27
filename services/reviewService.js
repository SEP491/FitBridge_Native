import { request } from "./request";

const reviewService = {
    createReview: (formData) => 
        request("PUT", "v1/reviews", formData, {
      "Content-Type": "multipart/form-data",
    }),

    getItemReviewsById(params) {
      return request("GET", "v1/reviews/feedback-target", null, null, params);
    },
};


export default reviewService;