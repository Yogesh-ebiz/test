const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');
const statusEnum = require('../const/statusEnum');
const UserResume = require('../models/userresume.model');
const UserResumeTemplate = require('../models/userresumetemplate.model');
const ResumeTemplate = require('../models/resumetemplate.model');

const userResumeSchema = Joi.object({
  template: Joi.object(),
  name: Joi.object().optional(),
  userId: Joi.number().allow(null).optional(),
  resume: Joi.object().optional().allow(null),
  source: Joi.object().optional().allow(null),
});

async function add(form) {

  if(!form){
    return;
  }

  const template = await ResumeTemplate.findById(form.template);
  if(template){
    const userResumeTemplate =  await new UserResumeTemplate({template: template._id, modules: template.modules}).save();
    form.template = userResumeTemplate._id;
    await userResumeSchema.validate(form, {abortEarly: false});

    if(form.source){
      const source = await findById(form.source);
      form.resume = source?.resume;
      form.name = form.name + '[COPY]'
    }
    const resume = await new UserResume(form).save();
    if(resume){
      userResumeTemplate.modules = [];
      userResumeTemplate.configs = null;
      template.modules = [];
      template.defaultConfig = null;
      resume.resume = null;
      resume.template = userResumeTemplate;
      resume.template.template = template;
      console.log(resume.template)
    }
    return resume;
  }

}

function findById(id) {

  if(!id){
    return;
  }

  return UserResume.findById(id);
}

function findByUserId(userId) {

  if(!userId){
    return;
  }

  return UserResume.find({userId});
}


function removeById(id) {

  if(!id){
    return;
  }

  return UserResume.deleteOne({_id: id});
}
async function updateTemplate(id, templateId, form) {

  if(!templateId || !form){
    return;
  }

  let template = null;
  let resume = await UserResume.findById(id).populate('template');
  if(resume && resume.template){
    template = resume.template;
    if(template._id.equals(templateId)){
      template.modules = form.modules;
      template.template = form.template;
      template.config = form.config;
      template.updatedAt = new Date();
      template = await template.save();
    }
  }


  return template;
}



module.exports = {
  add,
  findById,
  findByUserId,
  removeById,
  updateTemplate,
}
