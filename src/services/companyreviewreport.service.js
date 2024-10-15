const CompanyReviewReport = require('../models/companyreviewreport.model');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');

const createReport = async (reportBody) => {
    return CompanyReviewReport.create(reportBody);
};

const queryReports = async (filter, options) => {
    const reports = await CompanyReviewReport.paginate(filter, options);
    return reports;
};

const getReportById = async (id) => {
    return CompanyReviewReport.findById(id);
};

const findReportByReviewAndUserId = async (companyReviewId, userId) => {
    return await CompanyReviewReport.findOne({companyReviewId:companyReviewId, reportedBy: userId});
}

const deleteReportById = async (reportId) => {
    const report = await getReportById(reportId);
    if (!report) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Report not found');
    }
    await report.remove();
    return report;
};

module.exports = {
    createReport,
    queryReports,
    getReportById,
    findReportByReviewAndUserId,
    deleteReportById,
};