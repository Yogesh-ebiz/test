const Joi = require('joi');
const _ = require('lodash');
const {ObjectId} = require('mongoose');
const subjectType = require('../const/subjectType');
const catchAsync = require("../utils/catchAsync");
const jobService = require('../services/jobrequisition.service');
const userImpressionService = require("../services/userimpression.service");
const companyService = require('../services/company.service');

const capture = catchAsync(async (req, res) => {
    const { query } = req;
    const {token, type, source, subject, subjectType} = query;
    const currentUserId = parseInt(req.header('UserId'));

    let result;
    let subjectObj;
    switch(subjectType){
        case 'JOB':
            subjectObj = await jobService.findById(subject);
            break;
        case 'COMPANY':
            subjectObj = await companyService.findByCompanyId(subject);
            break;
        default:
            res.status(400).send('Invalid Subject Type query Parameter');
            break;
    }
    if(!subjectObj){
        res.status(400).send('Subject not found');
    }

    switch(type){
        case 'UNLIKE':
            await userImpressionService.removeImpression(currentUserId, subjectObj._id, subjectType, 'LIKED');
            return res.json({success: true, message: 'Like entry removed'});
        case 'UNSAVE':
            await userImpressionService.removeImpression(currentUserId, subjectObj._id, subjectType, 'SAVED');
            return res.json({success: true, message: 'Save entry removed'});
        default:
            result = await userImpressionService.add(currentUserId, subjectObj, subjectType, token, source, type);
            res.json(result);
            break;
    }
    
});

module.exports = {
    capture,
}
