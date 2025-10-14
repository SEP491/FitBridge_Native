import { request } from "./request";

const ptService = {
  getAllSlotsOfGym: (params) =>
    request("GET", "v1/gym-slots/all-pt-slots", null, {}, params),
  registerSlot: (data) => request("POST", "v1/gym-slots/register-slot", data),
  deactivateSlot: (data) =>
    request("POST", `v1/gym-slots/deactivated-slots`, data),

  getPtSlot: (dateParam) => request("GET", "v1/pt-slot", null, {}, dateParam),

  getPTDetail: (ptId) => request("GET", `v1/pt/${ptId}`),

  getPTForUser: (id, params) =>
    request("GET", `v1/pt-slot/${id}/user`, null, {}, params),

  checkMinimumSlot: (data) =>
    request("POST", "v1/gym-slots/check-minimum-slot", data),

};

export default ptService;
