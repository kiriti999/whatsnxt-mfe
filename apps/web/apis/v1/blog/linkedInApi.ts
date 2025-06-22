import { articleApiClient, courseApiClient } from '@whatsnxt/core-util';

export const LinkedInAPI = {
    /**
     * Check if LinkedIn token exists
     * @returns {Promise<boolean>} Whether token exists
     */
    checkToken: async function () {
        try {
            const { data } = await articleApiClient.get('/blog/linkedin/token-check');
            return data.tokenAvailable || false;
        } catch (error) {
            console.error('Error checking LinkedIn token:', error);
            return false;
        }
    },

    /**
     * Get LinkedIn authorization URL
     * @returns {Promise<string>} Authorization URL
     */
    getAuthUrl: async function () {
        try {
            const { data } = await courseApiClient.get('/blog/linkedin/auth-url');
            return data.authUrl;
        } catch (error) {
            console.error('Error fetching LinkedIn auth URL:', error);
            throw error;
        }
    },

    /**
     * Handle LinkedIn OAuth callback
     * @param {string} code - Authorization code from LinkedIn
     * @returns {Promise<any>} Response data
     */
    handleCallback: async function (code) {
        const { data } = await courseApiClient.get(`/blog/linkedin/callback?code=${code}`);
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
        const { data } = await courseApiClient.post('/blog/linkedin/share', {
            url,
            title,
            email,
            text,
            thumbnailUrn,
            media: media || [],
        });
        return data.data;
    },
};