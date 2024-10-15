const _ = require('lodash');
const Joi = require('joi');
const ObjectID = require('mongodb').ObjectID;

const statusEnum = require('../const/statusEnum');
const subjectType = require('../const/subjectType');
const actionEnum = require('../const/actionEnum');
const notificationType = require('../const/notificationType');
const notificationEvent = require('../const/notificationEvent');

const CompanyReview = require('../models/companyreview.model');


const reviewSchema = Joi.object({
  user: Joi.object().required(),
  company: Joi.number().required(),
  employmentTitle: Joi.string().allow('').optional(),
  rating: Joi.number().required(),
  employmentType: Joi.string().required(),
  recommendCompany: Joi.boolean().required(),
  approveCEO: Joi.boolean(),
  isCurrentEmployee: Joi.boolean(),
  noOfMonthsEmployment: Joi.number(),
  reviewTitle: Joi.string(),
  pros: Joi.array(),
  cons: Joi.array(),
  advices: Joi.array(),
  city: Joi.string().optional(),
  state: Joi.string().optional(),
  country: Joi.string().optional(),
  overall: Joi.number().required(),
  careerOpportunity: Joi.number().optional(),
  compensationAndBenefits: Joi.number().optional(),
  culture: Joi.number().optional(),
  diversity: Joi.number().optional(),
  management: Joi.number().optional(),
  workLife: Joi.number().optional(),
})

async function findById(id) {
  let data = null;

  if(!id){
    return;
  }

  let review = CompanyReview.findById(id);
  return review
}

async function add(review) {
  let data = null;

  if(!review){
    return;
  }
  console.log(review)

  await reviewSchema.validate(review, {abortEarly: false});
  review = await new CompanyReview(review).save();

  return review;

}

const getPopularCompanies = async () => {
  try {
    const popularCompanies = await CompanyReview.aggregate([
      {
        $group: {
          _id: "$company",
          averageRating: { $avg: "$rating" },
          numRatings: { $sum: 1 },
          company: { $first: "$company" }
        }
      },
      {
        $sort: { averageRating: -1, numRatings: -1 }
      },
      {
        $limit: 10
      },
      {
        $project: {
          _id: 0,
          companyId: "$_id",
          averageRating: 1,
          numRatings: 1,
        }
      }
    ]);

    return popularCompanies;
  } catch (error) {
    console.error('Error fetching popular companies:', error);
    return [];
  }
}



module.exports = {
  findById,
  add,
  getPopularCompanies,
}
