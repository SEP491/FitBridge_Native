import { request } from "./request";

const gymService = {
  getAllGyms: (params) => request("GET", "v1/gyms", null, {}, params),

  searchGyms: (params) => request("GET", "v1/gyms", null, {}, params),

  getGymById: (id) => request("GET", `v1/gyms/${id}`),
  getCourseByGymId: (id) => request("GET", `v1/gym-courses/${id}`),
  getPTByGymId: (id) => request("GET", `v1/gyms/${id}/pts`),

  getSlotOfGym: (id) => request("GET", `v1/pt-slot/${id}/user`),

  getPTById: (id) => request("GET", `v1/gyms/${id}/pts`),

  getPTinGymCourse: (id) => request("GET", `v1/gym-courses/${id}/pts`),

  getCommentsByGymId: (gymId, params) =>
    request("GET", `v1/gym/${gymId}/comments`, null, {}, params),
  postComment: (gymId, data) =>
    request("POST", `v1/gym/${gymId}/comments`, data),
};

export default gymService;
