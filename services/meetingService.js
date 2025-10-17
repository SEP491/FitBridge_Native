import { request } from "./request";

const meetingService = {
  createMeeting: (data) => request("POST", "v1/meetings", data),
  getMeetingById: (id) => request("GET", `v1/meetings/${id}`),
};

export default meetingService;