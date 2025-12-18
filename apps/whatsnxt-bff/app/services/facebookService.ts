import axios from "axios";
import { getLogger } from "../../config/logger";
const logger = getLogger("facebookService");

class FacebookService {
  private graphApiUrl: string;
  private pageId: string | undefined;
  private accessToken: string | undefined;

  constructor() {
    this.graphApiUrl = "https://graph.facebook.com/v12.0";

    // Validate environment variables
    this.validateEnvironmentVariables();

    this.pageId = process.env.FACEBOOK_PAGE_ID;
    this.accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
  }

  validateEnvironmentVariables() {
    const required = ["FACEBOOK_PAGE_ID", "FACEBOOK_ACCESS_TOKEN"];
    const missing = required.filter((env) => !process.env[env]);

    if (missing.length > 0) {
      logger.warn(
        `Facebook Service: Missing environment variables: ${missing.join(", ")}`,
      );
    }
  }

  async uploadPhoto(photoUrl) {
    try {
      if (!photoUrl) {
        throw new Error("Photo URL is required");
      }

      if (!this.pageId || !this.accessToken) {
        throw new Error("Facebook page ID and access token are required");
      }

      // Validate URL format
      try {
        new URL(photoUrl);
      } catch {
        throw new Error("Invalid photo URL format");
      }

      const url = `${this.graphApiUrl}/${this.pageId}/photos`;

      const params = {
        access_token: this.accessToken,
        url: photoUrl,
        published: false, // Upload but don't publish yet
      };

      logger.info(
        "FacebookService :: uploadPhoto :: Uploading photo:",
        photoUrl,
      );

      const response = await axios.post(url, null, {
        params,
        timeout: 30000, // 30 second timeout
      });

      if (!response.data.id) {
        throw new Error("Facebook did not return a photo ID");
      }

      logger.info(
        "FacebookService :: uploadPhoto :: Photo uploaded successfully. ID:",
        response.data.id,
      );
      return response.data.id;
    } catch (error) {
      logger.error(
        "FacebookService :: uploadPhoto :: error:",
        error.response?.data || error.message,
      );

      if (error.response?.status === 400) {
        throw new Error(
          `Invalid request: ${error.response?.data?.error?.message || "Bad request"}`,
        );
      } else if (error.response?.status === 401) {
        throw new Error("Invalid access token or insufficient permissions");
      } else if (error.response?.status === 403) {
        throw new Error(
          "Permission denied. Check page access token permissions",
        );
      }

      throw new Error(`Failed to upload photo: ${error.message}`);
    }
  }

  async postArticleWithPhoto(message, photoUrl) {
    try {
      if (!message) {
        throw new Error("Message is required");
      }

      if (!this.pageId || !this.accessToken) {
        throw new Error("Facebook page ID and access token are required");
      }

      let photoId = null;

      // Upload photo if provided
      if (photoUrl) {
        photoId = await this.uploadPhoto(photoUrl);
      }

      // Post the message with or without photo
      const url = `${this.graphApiUrl}/${this.pageId}/feed`;

      const params: any = {
        message: message.trim(),
        access_token: this.accessToken,
      };

      // Attach photo if uploaded
      if (photoId) {
        params.attached_media = JSON.stringify([{ media_fbid: photoId }]);
      }

      logger.info(
        "FacebookService :: postArticleWithPhoto :: Posting to Facebook...",
      );

      const response = await axios.post(url, null, {
        params,
        timeout: 30000,
      });

      if (!response.data.id) {
        throw new Error("Facebook did not return a post ID");
      }

      logger.info(
        "FacebookService :: postArticleWithPhoto :: Post created successfully. ID:",
        response.data.id,
      );

      return {
        postId: response.data.id,
        message,
        photoId,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error(
        "FacebookService :: postArticleWithPhoto :: error:",
        error.response?.data || error.message,
      );

      if (error.response?.status === 400) {
        throw new Error(
          `Invalid request: ${error.response?.data?.error?.message || "Bad request"}`,
        );
      } else if (error.response?.status === 401) {
        throw new Error("Invalid access token or insufficient permissions");
      } else if (error.response?.status === 403) {
        throw new Error(
          "Permission denied. Check page access token permissions",
        );
      }

      throw new Error(`Failed to post article: ${error.message}`);
    }
  }

  async postSimpleMessage(message) {
    try {
      if (!message) {
        throw new Error("Message is required");
      }

      if (!this.pageId || !this.accessToken) {
        throw new Error("Facebook page ID and access token are required");
      }

      const url = `${this.graphApiUrl}/${this.pageId}/feed`;

      const params = {
        message: message.trim(),
        access_token: this.accessToken,
      };

      logger.info(
        "FacebookService :: postSimpleMessage :: Posting message to Facebook...",
      );

      const response = await axios.post(url, null, {
        params,
        timeout: 30000,
      });

      logger.info(
        "FacebookService :: postSimpleMessage :: Message posted successfully. ID:",
        response.data.id,
      );

      return {
        postId: response.data.id,
        message,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error(
        "FacebookService :: postSimpleMessage :: error:",
        error.response?.data || error.message,
      );
      throw new Error(`Failed to post message: ${error.message}`);
    }
  }

  async shareLink(url, message) {
    try {
      if (!url) {
        throw new Error("URL is required");
      }

      if (!this.pageId || !this.accessToken) {
        throw new Error("Facebook page ID and access token are required");
      }

      // Validate URL format
      try {
        new URL(url);
      } catch {
        throw new Error("Invalid URL format");
      }

      const apiUrl = `${this.graphApiUrl}/${this.pageId}/feed`;

      const params: any = {
        link: url,
        access_token: this.accessToken,
      };

      if (message) {
        params.message = message.trim();
      }

      logger.info(
        "FacebookService :: shareLink :: Sharing link to Facebook:",
        url,
      );

      const response = await axios.post(apiUrl, null, {
        params,
        timeout: 30000,
      });

      logger.info(
        "FacebookService :: shareLink :: Link shared successfully. ID:",
        response.data.id,
      );

      return {
        postId: response.data.id,
        link: url,
        message: message || "",
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error(
        "FacebookService :: shareLink :: error:",
        error.response?.data || error.message,
      );
      throw new Error(`Failed to share link: ${error.message}`);
    }
  }

  async deletePost(postId) {
    try {
      if (!postId) {
        throw new Error("Post ID is required");
      }

      if (!this.accessToken) {
        throw new Error("Facebook access token is required");
      }

      const url = `${this.graphApiUrl}/${postId}`;

      const params = {
        access_token: this.accessToken,
      };

      logger.info(
        "FacebookService :: deletePost :: Deleting Facebook post:",
        postId,
      );

      const response = await axios.delete(url, {
        params,
        timeout: 30000,
      });

      logger.info("FacebookService :: deletePost :: Post deleted successfully");

      return {
        success: response.data.success || true,
        postId,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error(
        "FacebookService :: deletePost :: error:",
        error.response?.data || error.message,
      );

      if (error.response?.status === 404) {
        throw new Error("Post not found or already deleted");
      }

      throw new Error(`Failed to delete post: ${error.message}`);
    }
  }

  async getPageInfo() {
    try {
      if (!this.pageId || !this.accessToken) {
        throw new Error("Facebook page ID and access token are required");
      }

      const url = `${this.graphApiUrl}/${this.pageId}`;

      const params = {
        fields:
          "id,name,username,link,followers_count,fan_count,about,category",
        access_token: this.accessToken,
      };

      logger.info(
        "FacebookService :: getPageInfo :: Fetching page information...",
      );

      const response = await axios.get(url, {
        params,
        timeout: 30000,
      });

      return {
        ...response.data,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error(
        "FacebookService :: getPageInfo :: error:",
        error.response?.data || error.message,
      );
      throw new Error(`Failed to get page info: ${error.message}`);
    }
  }

  async getPagePosts(limit = 10) {
    try {
      if (!this.pageId || !this.accessToken) {
        throw new Error("Facebook page ID and access token are required");
      }

      const url = `${this.graphApiUrl}/${this.pageId}/posts`;

      const params = {
        fields:
          "id,message,created_time,permalink_url,attachments,likes.summary(true),comments.summary(true)",
        limit: Math.min(limit, 100), // Facebook API limit
        access_token: this.accessToken,
      };

      logger.info("FacebookService :: getPagePosts :: Fetching page posts...");

      const response = await axios.get(url, {
        params,
        timeout: 30000,
      });

      return {
        posts: response.data.data || [],
        paging: response.data.paging,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error(
        "FacebookService :: getPagePosts :: error:",
        error.response?.data || error.message,
      );
      throw new Error(`Failed to get page posts: ${error.message}`);
    }
  }

  async updatePost(postId, message) {
    try {
      if (!postId || !message) {
        throw new Error("Post ID and message are required");
      }

      if (!this.accessToken) {
        throw new Error("Facebook access token is required");
      }

      const url = `${this.graphApiUrl}/${postId}`;

      const params = {
        message: message.trim(),
        access_token: this.accessToken,
      };

      logger.info(
        "FacebookService :: updatePost :: Updating Facebook post:",
        postId,
      );

      const response = await axios.post(url, null, {
        params,
        timeout: 30000,
      });

      logger.info("FacebookService :: updatePost :: Post updated successfully");

      return {
        success: response.data.success || true,
        postId,
        message,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error(
        "FacebookService :: updatePost :: error:",
        error.response?.data || error.message,
      );

      if (error.response?.status === 404) {
        throw new Error("Post not found");
      } else if (error.response?.status === 403) {
        throw new Error("Permission denied. Cannot edit this post");
      }

      throw new Error(`Failed to update post: ${error.message}`);
    }
  }

  async validateAccessToken() {
    try {
      if (!this.accessToken) {
        throw new Error("Facebook access token is required");
      }

      const url = `${this.graphApiUrl}/me`;

      const params = {
        access_token: this.accessToken,
      };

      logger.info(
        "FacebookService :: validateAccessToken :: Validating access token...",
      );

      const response = await axios.get(url, {
        params,
        timeout: 10000,
      });

      return {
        valid: true,
        tokenInfo: response.data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error(
        "FacebookService :: validateAccessToken :: error:",
        error.response?.data || error.message,
      );

      return {
        valid: false,
        error: error.response?.data?.error?.message || error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Utility methods
  formatMessage(title, content, url) {
    try {
      let message = "";

      if (title) {
        message += `${title}\n\n`;
      }

      if (content) {
        // Strip HTML and limit content length
        const cleanContent = content
          .replace(/<[^>]*>/g, "")
          .replace(/\s+/g, " ")
          .trim();

        const maxContentLength = 500;
        const truncatedContent =
          cleanContent.length > maxContentLength
            ? cleanContent.substring(0, maxContentLength) + "..."
            : cleanContent;

        message += `${truncatedContent}\n\n`;
      }

      if (url) {
        message += `Read more: ${url}`;
      }

      return message.trim();
    } catch (error) {
      logger.error("FacebookService :: formatMessage :: error:", error);
      return title || content || "";
    }
  }

  // Get service information
  getServiceInfo() {
    return {
      service: "FacebookService",
      apiVersion: "v12.0",
      pageId: this.pageId ? "***" + this.pageId.slice(-4) : "Not configured",
      hasAccessToken: !!this.accessToken,
      features: [
        "postMessage",
        "uploadPhoto",
        "shareLink",
        "deletePost",
        "updatePost",
        "getPageInfo",
        "getPagePosts",
      ],
      configured: !!(this.pageId && this.accessToken),
    };
  }
}

// Create singleton instance
const facebookService = new FacebookService();

export { FacebookService, facebookService };
