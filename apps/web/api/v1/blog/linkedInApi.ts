import { bffApiClient } from '@whatsnxt/core-util';

export const LinkedInAPI = {
    /**
     * Handle LinkedIn OAuth callback
     * @param {string} code - Authorization code from LinkedIn
     * @returns {Promise<any>} Response data
     */
    handleCallback: async function (code) {
        const { data } = await bffApiClient.post('/linkedin/callback', { code });
        return data.data?.callback;
    },

    /**
     * Share a post to LinkedIn
     * @param {Object} postData - Post data
     * @param {string} postData.url - URL to share
     * @param {string} postData.title - Post title
     * @param {string} postData.email - User email
     * @param {string} postData.text - Post text content
     * @param {string} postData.thumbnailUrn - Optional thumbnail URN
     * @param {string[]} postData.media - Array of media URLs
     * @returns {Promise<any>} Response data
     */
    sharePost: async function ({ url, title, email, text, thumbnailUrn, media }) {
        const { data } = await bffApiClient.post('/linkedin/share', {
            url,
            title,
            email,
            text,
            thumbnailUrn,
            media: media || [],
        });
        return data.data?.shareLinkedInPost;
    },
};