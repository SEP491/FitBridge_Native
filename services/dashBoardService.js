import { request } from "./request";

const dashBoardService = {
    getWalletBalance: () => request("GET", "v1/dashboard/wallet-balance"),
    getAvailableBalanceDetail: () => request("GET", "v1/dashboard/available-balance-detail"),
    getPendingBalanceDetail: () => request("GET", "v1/dashboard/pending-balance-detail"),
    getRevenueDetail: () => request("GET", "v1/dashboard/revenue-detail"),
}

export default dashBoardService;