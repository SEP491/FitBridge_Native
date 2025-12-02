import { request } from "./request";

const reviewService = {
    createReview: (formData) => 
        request("POST", "v1/reviews", formData, {
      "Content-Type": "multipart/form-data",
    }),


    getItemReviewsById(params) {
      return request("GET", "v1/reviews/feedback-target", null, null, params);
    },

    getReviewedContent: (params) =>
        request("GET", "v1/reviews/customer", null, {}, params),

    editReview: (formData) =>
        request("PUT", "v1/reviews", formData, {
            "Content-Type": "multipart/form-data",
        }),

    deleteReview: (id) =>
        request("DELETE", `v1/reviews/${id}`),
};


export default reviewService;