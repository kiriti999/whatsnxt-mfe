import axios from "axios";
import mongoose from "mongoose";
import { getLogger } from "../../config/logger";
const logger = getLogger("linkedInService");

// LinkedIn API Constants
const LINKEDIN_API_URL_V1 = "https://api.linkedin.com/v2/ugcPosts";
const LINKEDIN_API_URL_V2 = "https://api.linkedin.com/rest/posts";
const LINKEDIN_IMAGE_UPLOAD_URL_V1 =
  "https://api.linkedin.com/v2/assets?action=registerUpload";
const LINKEDIN_IMAGE_UPLOAD_URL_V2 =
  "https://api.linkedin.com/rest/images?action=initializeUpload";
const LINKEDIN_VERSION_NUMBER = "202505";
const LINKEDIN_AUTH_URL = "https://www.linkedin.com/oauth/v2";

class LinkedInService {
  private accessToken: string | null;
  private refreshToken: string | null;
  private accessTokenExpiry: number | null;
  private CLIENT_ID: string | undefined;
  private CLIENT_SECRET: string | undefined;
  private REDIRECT_URI: string | undefined;
  private ORGANIZATION_ID: string | undefined;
  private ADMIN_EMAIL: string | undefined;

  constructor() {
    this.accessToken = null;
    this.refreshToken = null;
    this.accessTokenExpiry = null;

    this.validateEnvironmentVariables();
  }

  validateEnvironmentVariables() {
    const required = [
      "LINKEDIN_CLIENT_ID",
      "LINKEDIN_CLIENT_SECRET",
      "LINKEDIN_REDIRECT_URI",
      "LINKEDIN_ORGANIZATION_ID",
      "ADMIN_EMAIL",
    ];

    const missing = required.filter((env) => !process.env[env]);
    if (missing.length > 0) {
      logger.warn(
        `LinkedInService: Missing environment variables: ${missing.join(", ")}`,
      );
    }

    this.CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
    this.CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
    this.REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI;
    this.ORGANIZATION_ID = process.env.LINKEDIN_ORGANIZATION_ID;
    this.ADMIN_EMAIL = process.env.ADMIN_EMAIL;
  }

  async isTokenAvailable() {
    try {
      const LinkedInToken = mongoose.model("linkedinTokens");
      const tokenRecord = await LinkedInToken.findOne({
        organizationId: this.ORGANIZATION_ID,
      }).lean();
      return !!tokenRecord && (tokenRecord as any).expiresAt > Date.now();
    } catch (error) {
      return false;
    }
  }

  async generateAuthUrl() {
    const scopes = [
      "openid",
      "profile",
      "email",
      "r_ads",
      "r_ads_reporting",
      "r_basicprofile",
      "r_organization_admin",
      "r_organization_social",
      "rw_ads",
      "rw_organization_admin",
      "w_member_social",
      "w_organization_social",
    ];

    const authUrl = `${LINKEDIN_AUTH_URL}/authorization?response_type=code&client_id=${this.CLIENT_ID}&redirect_uri=${encodeURIComponent(this.REDIRECT_URI)}&scope=${scopes.join("%20")}`;
    return { authUrl };
  }

  async exchangeAuthCode(authCode) {
    try {
      if (!authCode) throw new Error("Authorization code is required");

      const response = await axios.post(
        `${LINKEDIN_AUTH_URL}/accessToken`,
        new URLSearchParams({
          grant_type: "authorization_code",
          code: authCode,
          redirect_uri: this.REDIRECT_URI,
          client_id: this.CLIENT_ID,
          client_secret: this.CLIENT_SECRET,
        }),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
      );

      const { access_token, refresh_token, expires_in } = response.data;
      await this.saveTokens(access_token, refresh_token, expires_in);
      return { message: "Tokens saved successfully" };
    } catch (error) {
      // Log the actual error details
      logger.error("LinkedIn token exchange error:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });

      await this.deleteTokensFromDb();
      throw new Error(
        `Failed to exchange auth code: ${error.response?.data?.error_description || error.message}`,
      );
    }
  }

  async loadTokens() {
    try {
      const LinkedInToken = mongoose.model("linkedinTokens");
      const tokenRecord = await LinkedInToken.findOne({
        organizationId: this.ORGANIZATION_ID,
      }).lean();

      if (tokenRecord) {
        this.accessToken = (tokenRecord as any).accessToken;
        this.refreshToken = (tokenRecord as any).refreshToken;
        this.accessTokenExpiry = (tokenRecord as any).expiresAt;
      } else {
        throw new Error("LinkedIn tokens not configured");
      }
    } catch (error) {
      throw new Error("LinkedIn tokens not configured");
    }
  }

  async saveTokens(accessToken, refreshToken, expiresIn) {
    try {
      const LinkedInToken = mongoose.model("linkedinTokens");
      const expiresAt = Date.now() + expiresIn * 1000;
      const tokenData = {
        organizationId: this.ORGANIZATION_ID,
        accessToken,
        refreshToken,
        expiresAt,
      };
      await LinkedInToken.findOneAndUpdate(
        { organizationId: this.ORGANIZATION_ID },
        tokenData,
        { upsert: true, new: true },
      );
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      this.accessTokenExpiry = expiresAt;
    } catch (error) {
      throw new Error("Failed to save LinkedIn tokens");
    }
  }

  async refreshAccessToken() {
    try {
      if (!this.refreshToken) {
        await this.loadTokens();
      }
      const response = await axios.post(
        `${LINKEDIN_AUTH_URL}/accessToken`,
        new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: this.refreshToken,
          client_id: this.CLIENT_ID,
          client_secret: this.CLIENT_SECRET,
        }),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
      );
      const { access_token, refresh_token, expires_in } = response.data;
      await this.saveTokens(access_token, refresh_token, expires_in);
    } catch (error) {
      await this.deleteTokensFromDb();
      throw new Error("Failed to refresh LinkedIn access token");
    }
  }

  async deleteTokensFromDb() {
    try {
      const LinkedInToken = mongoose.model("linkedinTokens");
      await LinkedInToken.deleteOne({ organizationId: this.ORGANIZATION_ID });
      this.accessToken = null;
      this.refreshToken = null;
      this.accessTokenExpiry = null;
    } catch (error) {
      // log and move on
    }
  }

  async ensureValidAccessToken() {
    if (
      !this.accessToken ||
      (this.accessTokenExpiry && Date.now() >= this.accessTokenExpiry)
    ) {
      await this.refreshAccessToken();
    }
  }

  truncateText(text, maxLength = 3000) {
    if (!text || typeof text !== "string") return "";
    if (text.length > maxLength) return text.slice(0, maxLength - 3) + "...";
    return text;
  }

  stripHtml(html) {
    if (!html || typeof html !== "string") return "";
    const withLineBreaks = html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<[^>]*>?/gm, "");
    return withLineBreaks
      .replace(/&nbsp;/g, " ")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&");
  }

  async uploadImageToLinkedInV1(imageUrl) {
    await this.ensureValidAccessToken();
    try {
      const initResponse = await axios.post(
        LINKEDIN_IMAGE_UPLOAD_URL_V1,
        {
          registerUploadRequest: {
            owner: `urn:li:organization:${this.ORGANIZATION_ID}`,
            recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
            serviceRelationships: [
              {
                identifier: "urn:li:userGeneratedContent",
                relationshipType: "OWNER",
              },
            ],
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
            "LinkedIn-Version": "202501",
          },
        },
      );
      const { uploadMechanism, asset } = initResponse.data.value;
      const uploadUrl =
        uploadMechanism[
          "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
        ].uploadUrl;
      if (!uploadUrl || !asset)
        throw new Error(
          "LinkedIn did not return a valid upload URL or asset URN",
        );
      const imageBuffer = await axios.get(imageUrl, {
        responseType: "arraybuffer",
      });
      if (imageBuffer.data.byteLength === 0)
        throw new Error("Failed to fetch image data. Image buffer is empty");
      await axios.put(uploadUrl, imageBuffer.data, {
        headers: { "Content-Type": "application/octet-stream" },
      });
      return asset;
    } catch (error) {
      throw new Error("Image upload to LinkedIn V1 failed");
    }
  }

  async uploadImageToLinkedInV2(imageUrl) {
    await this.ensureValidAccessToken();
    try {
      const initResponse = await axios.post(
        LINKEDIN_IMAGE_UPLOAD_URL_V2,
        {
          initializeUploadRequest: {
            owner: `urn:li:organization:${this.ORGANIZATION_ID}`,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
            "LinkedIn-Version": LINKEDIN_VERSION_NUMBER,
            "X-Restli-Protocol-Version": "2.0.0",
          },
        },
      );
      const { value } = initResponse.data;
      const { uploadUrl, image } = value;
      if (!uploadUrl || !image)
        throw new Error(
          "LinkedIn did not return a valid upload URL or image URN",
        );
      const imageBuffer = await axios.get(imageUrl, {
        responseType: "arraybuffer",
      });
      if (imageBuffer.data.byteLength === 0)
        throw new Error("Failed to fetch image data. Image buffer is empty");
      await axios.put(uploadUrl, imageBuffer.data, {
        headers: { "Content-Type": "application/octet-stream" },
      });
      return image;
    } catch (error) {
      throw new Error("Image upload to LinkedIn V2 failed");
    }
  }

  async sharePost(
    url,
    title,
    email,
    text,
    thumbnailUrn,
    media = [],
    version = "v1",
    userId,
  ) {
    logger.info(" LinkedInService :: sharePost :: userId:", userId);
    if (!this.refreshToken) await this.loadTokens();
    await this.ensureValidAccessToken();

    const truncatedText = this.truncateText(this.stripHtml(text), 3000);
    let imageUrn = null;
    if (thumbnailUrn) {
      if (version === "v1")
        imageUrn = await this.uploadImageToLinkedInV1(thumbnailUrn);
      else imageUrn = await this.uploadImageToLinkedInV2(thumbnailUrn);
    }
    let postData, apiUrl, headers;
    logger.info(
      " LinkedInService :: sharePost :: this.ORGANIZATION_ID:",
      this.ORGANIZATION_ID,
    );
    if (version === "v1") {
      postData = {
        author: `urn:li:organization:${this.ORGANIZATION_ID}`,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: { text: truncatedText },
            shareMediaCategory: imageUrn ? "IMAGE" : "ARTICLE",
            media: [
              {
                media: imageUrn,
                status: "READY",
                originalUrl: url,
                title: { text: title },
              },
            ],
          },
        },
        visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
      };
      apiUrl = LINKEDIN_API_URL_V1;
      headers = {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
        "LinkedIn-Version": "202501",
      };
    } else {
      postData = {
        author: `urn:li:organization:${this.ORGANIZATION_ID}`,
        commentary: truncatedText,
        visibility: "PUBLIC",
        distribution: {
          feedDistribution: "MAIN_FEED",
          targetEntities: [],
          thirdPartyDistributionChannels: [],
        },
        content: {
          article: {
            source: url,
            title: title,
            description: truncatedText,
          },
        },
        lifecycleState: "PUBLISHED",
        isReshareDisabledByAuthor: false,
      };
      if (imageUrn) postData.content.media = { title: title, id: imageUrn };
      apiUrl = LINKEDIN_API_URL_V2;
      headers = {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
        "LinkedIn-Version": LINKEDIN_VERSION_NUMBER,
        "X-Restli-Protocol-Version": "2.0.0",
      };
    }
    const response = await axios.post(apiUrl, postData, { headers });
    if (response.status === 201) {
      const LinkedInPost = mongoose.model("linkedinPosts");
      const linkedInPost = await LinkedInPost.create({
        userId: userId.toString(),
        postId: response.data.id,
        author: email,
        title,
        text,
        url,
        thumbnailUrn,
        imageUrn,
        media,
        version,
        organizationId: `urn:li:organization:${this.ORGANIZATION_ID}`,
        linkedinResponse: response.data,
      });
      return {
        message: "Post created successfully",
        data: linkedInPost.toObject(),
        linkedinPostId: response.data.id,
      };
    }
    throw new Error("Unexpected LinkedIn API response");
  }

  async updatePost(email, postId, text, version) {
    await this.ensureValidAccessToken();
    const LinkedInPost = mongoose.model("linkedinPosts");
    const postInDb = await LinkedInPost.findOne({ postId }).lean();
    if (!postInDb) throw new Error("Post not found in the database");
    const apiVersion = version || (postInDb as any).version || "v1";
    const truncatedText = this.truncateText(this.stripHtml(text), 3000);
    let updateData, apiUrl, headers;
    if (apiVersion === "v1") {
      updateData = {
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: { text: truncatedText },
          },
        },
      };
      apiUrl = `${LINKEDIN_API_URL_V1}/${postId}`;
      headers = {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
        "LinkedIn-Version": "202501",
      };
    } else {
      updateData = { commentary: truncatedText };
      apiUrl = `${LINKEDIN_API_URL_V2}/${postId}`;
      headers = {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
        "LinkedIn-Version": LINKEDIN_VERSION_NUMBER,
        "X-Restli-Protocol-Version": "2.0.0",
      };
    }
    const response = await axios.put(apiUrl, updateData, { headers });
    const updatedPost = await LinkedInPost.findOneAndUpdate(
      { postId },
      {
        $set: {
          text,
          updatedAt: new Date(),
          version: apiVersion,
          lastLinkedInUpdate: new Date(),
        },
      },
      { new: true },
    );
    return {
      message: "Post updated successfully",
      data: updatedPost.toObject(),
    };
  }

  async deletePost(email, postId, version) {
    await this.ensureValidAccessToken();
    const LinkedInPost = mongoose.model("linkedinPosts");
    const postInDb = await LinkedInPost.findOne({ postId }).lean();
    if (!postInDb) throw new Error("Post not found in the database");
    const apiVersion = version || (postInDb as any).version || "v1";
    let apiUrl, headers;
    if (apiVersion === "v1") {
      apiUrl = `${LINKEDIN_API_URL_V1}/${postId}`;
      headers = {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
        "LinkedIn-Version": "202501",
      };
    } else {
      apiUrl = `${LINKEDIN_API_URL_V2}/${postId}`;
      headers = {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
        "LinkedIn-Version": LINKEDIN_VERSION_NUMBER,
        "X-Restli-Protocol-Version": "2.0.0",
      };
    }
    await axios.delete(apiUrl, { headers });
    await LinkedInPost.deleteOne({ postId });
    return { message: "Post deleted successfully" };
  }

  async getMyPosts(email, limit = 20, skip = 0) {
    const LinkedInPost = mongoose.model("linkedinPosts");
    const posts = await LinkedInPost.find({ author: email })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    const total = await LinkedInPost.countDocuments({ author: email });
    return {
      posts: posts.map((post) => ({ ...post, _id: post._id.toString() })),
      total,
      hasMore: skip + posts.length < total,
    };
  }

  async getPostAnalytics() {
    const LinkedInPost = mongoose.model("linkedinPosts");
    const analytics = await LinkedInPost.aggregate([
      {
        $group: {
          _id: null,
          totalPosts: { $sum: 1 },
          v1Posts: { $sum: { $cond: [{ $eq: ["$version", "v1"] }, 1, 0] } },
          v2Posts: { $sum: { $cond: [{ $eq: ["$version", "v2"] }, 1, 0] } },
          postsWithImages: {
            $sum: { $cond: [{ $ne: ["$imageUrn", null] }, 1, 0] },
          },
          uniqueAuthors: { $addToSet: "$author" },
        },
      },
      {
        $project: {
          _id: 0,
          totalPosts: 1,
          v1Posts: 1,
          v2Posts: 1,
          postsWithImages: 1,
          uniqueAuthors: { $size: "$uniqueAuthors" },
          imageUsageRate: {
            $round: [
              {
                $multiply: [
                  { $divide: ["$postsWithImages", "$totalPosts"] },
                  100,
                ],
              },
              1,
            ],
          },
        },
      },
    ]);
    const result = analytics[0] || {
      totalPosts: 0,
      v1Posts: 0,
      v2Posts: 0,
      postsWithImages: 0,
      uniqueAuthors: 0,
      imageUsageRate: 0,
    };
    return result;
  }

  async validateTokenHealth() {
    if (!this.accessToken) await this.loadTokens();
    if (!this.accessToken) {
      return {
        isValid: false,
        reason: "No access token available",
        needsReauth: true,
      };
    }
    if (this.accessTokenExpiry && Date.now() >= this.accessTokenExpiry) {
      try {
        await this.refreshAccessToken();
        return {
          isValid: true,
          reason: "Token refreshed successfully",
          expiresAt: new Date(this.accessTokenExpiry),
        };
      } catch (error) {
        return {
          isValid: false,
          reason: "Token refresh failed",
          needsReauth: true,
          error: error.message,
        };
      }
    }
    return {
      isValid: true,
      reason: "Token is valid",
      expiresAt: new Date(this.accessTokenExpiry),
    };
  }

  getServiceInfo() {
    return {
      service: "LinkedInService",
      organizationId: this.ORGANIZATION_ID
        ? "***" + this.ORGANIZATION_ID.slice(-4)
        : "Not configured",
      hasTokens: !!this.accessToken,
      tokenExpiry: this.accessTokenExpiry
        ? new Date(this.accessTokenExpiry).toISOString()
        : "Not set",
      apiVersions: ["v1", "v2"],
      features: [
        "post_sharing",
        "post_management",
        "image_upload",
        "token_management",
        "analytics",
        "post_history",
      ],
      configured: !!(
        this.CLIENT_ID &&
        this.CLIENT_SECRET &&
        this.REDIRECT_URI &&
        this.ORGANIZATION_ID
      ),
      databaseType: "mongoose",
    };
  }
}

// Singleton export
const linkedInService = new LinkedInService();
export { LinkedInService, linkedInService };
