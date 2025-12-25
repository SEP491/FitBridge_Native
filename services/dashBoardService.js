import { request } from "./request";

const dashBoardService = {
    getWalletBalance: () => request("GET", "v1/dashboard/wallet-balance"),
    getAvailableBalanceDetail: () => request("GET", "v1/dashboard/available-balance-detail"),
    getPendingBalanceDetail: () => request("GET", "v1/dashboard/pending-balance-detail"),
    getRevenueDetail: () => request("GET", "v1/dashboard/revenue-detail"),
    getRevenueDetails: (params) => request("GET", "v1/dashboard/revenue-detail", null, {}, params),
    getDisbursementDetail: () => request("GET", "v1/dashboard/disbursement-detail"),
    getFreelancePTDashboard: () => request("GET", "v1/dashboard/freelance-pt"),
    getBalanceOfGym: (params) => request("GET", "v1/dashboard/balance-of-gym", null, {}, params),
}

export default dashBoardService;