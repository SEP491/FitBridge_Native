import { request } from "./request";

const UserGoalService = {
    getUserGoals: (id) =>
        request("GET", `v1/user-goals/${id}`),
    createUserGoals: (data) =>
        request("POST", "v1/user-goals", data),
    updateUserGoals: (id, data) =>
        request("PUT", `v1/user-goals/${id}`, data),
    checkExistUserGoals: (customerPurchasedId) =>
        request("GET", `v1/user-goals/check/${customerPurchasedId}`),
};

export default UserGoalService;
