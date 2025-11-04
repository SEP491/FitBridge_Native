import { request } from "./request";

const ReportService = {
    getMyReports: () =>
        request("GET", `v1/reports/customer`),
    getReportDetail: (id) =>
        request("GET", `v1/reports/${id}`),
    createReport: (data) =>
        request("POST", "v1/reports", data),
};

export default ReportService;