const Joi = require('joi');
const { objectId } = require('./custom.validation');

const composeEmail = {
    body: Joi.object().keys({
        message: Joi.string().required(),
        isHtml: Joi.boolean().required(),
        cc: Joi.array().optional(),
        bcc: Joi.array().optional(),
        from: Joi.object().required(),
        meta: Joi.object().required(),
        subject: Joi.string().required(),
        to: Joi.array().required(),
        type: Joi.string().required(),
        whenToSend: Joi.string().required(),
        attachmentId: Joi.string().allow('').optional(),
        threadId: Joi.string().allow('').optional(),
        emailType: Joi.string().required(),
        tracking: Joi.object().optional(),
        signatureId: Joi.string().custom(objectId).allow('').optional(),
    }),
};

const uploadEmailAttachmentById = {
    params: Joi.object().keys({
        emailId: Joi.string().required(),
    }),
    body: Joi.object().keys({
        file:Joi.any(),
    }),
}

module.exports = {
    composeEmail,
    uploadEmailAttachmentById
}
