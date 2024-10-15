const ApiClient = require('../apiManager');
const config = require('../../config/config'); // Assuming your config file is located here

const apiClient = new ApiClient(config.socialAccount.linkedInJobPostingUrl);

async function shareToLinkedIn(socialAccount, job) {

    const options = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${socialAccount.token}`,
        },
    }

    let jobPostContent = {
        author: 'urn:li:person:' + socialAccount.socialAccountUserId,
        lifecycleState: 'PUBLISHED',
        specificContent: {
            'com.linkedin.ugc.ShareContent': {
                shareCommentary: {
                    text: job.description,
                },
                shareMediaCategory: 'NONE',
            }
        },
        visibility: {
            'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
    };

    const response = await apiClient.post('/ugcPosts', jobPostContent, options);

    return response.data;
}

module.exports = {
  shareToLinkedIn,
};
