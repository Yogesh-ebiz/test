const JobReport = require('../models/jobreport.model');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');

const createReport = async (reportBody) => {
    return JobReport.create(reportBody);
};

const queryReports = async (filter, options) => {
    const reports = await JobReport.paginate(filter, options);
    return reports;
};

const getReportById = async (id) => {
    return JobReport.findById(id);
};

const findReportByJobAndUserId = async (jobId, userId) => {
    return await JobReport.findOne({jobId:jobId, reportedBy: userId});
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
    findReportByJobAndUserId,
    deleteReportById,
};