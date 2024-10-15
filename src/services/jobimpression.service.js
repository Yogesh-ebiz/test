const JobImpression = require('../models/jobimpression.model');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');

const getJobImpressionById = async (id) => {
    return JobImpression.findById(id);
};

const getByJobId = async (jobId) => {
    return JobImpression.findOne({jobId: jobId},'liked saved shared viewed applied')
}

module.exports = {
    getJobImpressionById,
    getByJobId
};