const {renderEmailTemplate} = require('../utils/helper');
const config = require('../config/config');
const fs = require('fs').promises;
const path = require('path');

async function generateNewTaskEmail(organizer, attendeeEmails, task){
    const emailContent = {
        from: {name:organizer.firstName +" " + organizer.lastName, email:organizer.email},
        to: attendeeEmails,
        cc: [],
        bcc:[],
        subject: `New Task Assigned: ${task.name}`,
        message: await renderEmailTemplate('taskTemplate', {
            taskName: task.name,
            taskDescription: task.description,
            taskStartDate: new Date(task.startDate).toLocaleDateString(),
            taskStartTime: new Date(task.startDate).toLocaleTimeString(),
            taskEndDate: new Date(task.endDate).toLocaleDateString(),
            taskEndTime: new Date(task.endDate).toLocaleTimeString(),
            organizerName: `${organizer.firstName} ${organizer.lastName}`
        }),
        isHtml: true,
        emailType: 'DIRECT',
        type: 'TASK_ASSIGNMENT',
        meta: {},
        whenToSend: new Date().toISOString(),
        threadId: ''
    };

    return emailContent;
}

async function generateWelcomeEmail(to, company, locale = 'en'){
    
    const localeFilePath = path.join(__dirname, '../locales', `${locale}.json`);
    let localizedContent;
    try {
        const localeFileContent = await fs.readFile(localeFilePath, 'utf8');
        localizedContent = JSON.parse(localeFileContent);
    } catch (error) {
        const fallbackLocaleFilePath = path.join(__dirname, '../locales', `en.json`);
        const fallbackLocaleFileContent = await fs.readFile(fallbackLocaleFilePath, 'utf8');
        localizedContent = JSON.parse(fallbackLocaleFileContent);
    }
    const emailContent = {
        from: {name: 'Accessed System', email:config.email.from},
        to: [to],
        cc: [],
        bcc:[],
        subject: localizedContent.welcome_email_subject,
        message: await renderEmailTemplate('welcomeEmail', {
            greeting: localizedContent.welcome_email_greeting,
            userName: to.name,
            body: localizedContent.welcome_email_body.replace('{{companyName}}', company.name),
            thanks: localizedContent.welcome_email_thanks,
            regards: localizedContent.welcome_email_regards,
            team: localizedContent.welcome_email_team,
            hotline: localizedContent.welcome_email_hotline,
            footer: localizedContent.welcome_email_footer,
        }),
        isHtml: true,
        emailType: 'DIRECT',
        type: 'WELCOME_MEMBER',
        meta: {},
        whenToSend: new Date().toISOString(),
        threadId: ''
    };

    return emailContent;
}

async function generateMemberInvitationEmail(invitedEmail, companyName, invitationId, locale = "en") {
    const localeFilePath = path.join(__dirname, '../locales', `${locale}.json`);
    let localeData;
    try {
        const localeFileContent = await fs.readFile(localeFilePath, 'utf8');
        localeData = JSON.parse(localeFileContent);
    } catch (error) {
        const fallbackLocaleFilePath = path.join(__dirname, '../locales', `en.json`);
        const fallbackLocaleFileContent = await fs.readFile(fallbackLocaleFilePath, 'utf8');
        localeData = JSON.parse(fallbackLocaleFileContent);
    }
  
    const emailContent = {
      from: {name: 'Accessed System', email: config.email.from},
      to: [{name: invitedEmail, email: invitedEmail}],
      cc: [],
      bcc: [],
      subject: localeData.member_invitation_email_subject.replace('{{companyName}}', companyName),
      message: await renderEmailTemplate('memberInvitation', {
        greeting: localeData.member_invitation_email_greeting,
        invitationMessage: localeData.member_invitation_email_invitationMessage.replace('{{companyName}}', companyName),
        invitationLink: config.services.member_invitation_url + "?id=" + invitationId,
        buttonText: localeData.member_invitation_email_buttonText,
        thanks: localeData.member_invitation_email_thanks,
        regards: localeData.member_invitation_email_regards,
        team: localeData.member_invitation_email_team,
        hotline: localeData.member_invitation_email_hotline,
        footer: localeData.member_invitation_email_footer,
      }),
      isHtml: true,
      emailType: 'DIRECT',
      type: 'INVITATION_MEMBER',
      meta: {},
      whenToSend: new Date().toISOString(),
      threadId: ''
    };
  
    return emailContent;
  }

module.exports = {
    generateNewTaskEmail,
    generateWelcomeEmail,
    generateMemberInvitationEmail,
}