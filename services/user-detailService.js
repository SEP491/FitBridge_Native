import { request } from "./request";

const UserDetailService = {
    getUserDetail: () => request("GET", "v1/user-details"),
    updateUserDetail: (data) => request("PUT", "v1/user-details", data),
};

export default UserDetailService;   