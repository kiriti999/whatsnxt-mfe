// services/AlgoliaResetService.js
import algoliasearch, { SearchClient } from "algoliasearch";

interface IndexMapping {
  blog: string | undefined;
  course: string | undefined;
  tutorial: string | undefined;
}

class AlgoliaResetService {
  private algoliaClient: SearchClient;
  private indexes: IndexMapping;

  constructor() {
    if (!process.env.ALGOLIA_APP_ID || !process.env.ALGOLIA_SEARCH_ADMIN_KEY) {
      throw new Error(
        "Algolia credentials are missing from environment variables",
      );
    }

    this.algoliaClient = algoliasearch(
      process.env.ALGOLIA_APP_ID,
      process.env.ALGOLIA_SEARCH_ADMIN_KEY,
    );

    // Define index mappings
    this.indexes = {
      blog: process.env.ALGOLIA_BLOG_INDEX_NAME,
      course: process.env.ALGOLIA_COURSE_INDEX_NAME,
      tutorial: process.env.ALGOLIA_TUTORIAL_INDEX_NAME,
    };

    // Validate required indexes
    Object.entries(this.indexes).forEach(([type, indexName]) => {
      if (!indexName) {
        throw new Error(
          `Algolia ${type} index name is missing from environment variables`,
        );
      }
    });
  }

  async resetBlogIndex() {
    const index = this.algoliaClient.initIndex(this.indexes.blog);
    const response = await index.clearObjects();
    if (response.taskID) {
      return "Blog index reset successfully!";
    }
    throw new Error("Failed to reset blog index");
  }

  async resetCourseIndex() {
    const index = this.algoliaClient.initIndex(this.indexes.course);
    const response = await index.clearObjects();
    if (response.taskID) {
      return "Course index reset successfully!";
    }
    throw new Error("Failed to reset course index");
  }

  async resetTutorialIndex() {
    const index = this.algoliaClient.initIndex(this.indexes.tutorial);
    const response = await index.clearObjects();
    if (response.taskID) {
      return "Tutorial index reset successfully!";
    }
    throw new Error("Failed to reset tutorial index");
  }

  async resetAllIndexes() {
    const results = await Promise.allSettled([
      this.resetBlogIndex(),
      this.resetCourseIndex(),
      this.resetTutorialIndex(),
    ]);

    const responses = {
      blog: results[0],
      course: results[1],
      tutorial: results[2],
    };

    const successCount = results.filter((r) => r.status === "fulfilled").length;
    const failureCount = results.filter((r) => r.status === "rejected").length;

    return {
      message: `Reset completed: ${successCount} successful, ${failureCount} failed`,
      results: responses,
    };
  }

  // Generic reset method
  async resetIndex(type: keyof IndexMapping) {
    if (!this.indexes[type]) {
      throw new Error(
        `Unknown index type: ${type}. Available types: ${Object.keys(this.indexes).join(", ")}`,
      );
    }

    const index = this.algoliaClient.initIndex(this.indexes[type]);
    const response = await index.clearObjects();
    if (response.taskID) {
      return `${type} index reset successfully!`;
    }
    throw new Error(`Failed to reset ${type} index`);
  }
}

const algoliaResetService = new AlgoliaResetService();
export { AlgoliaResetService, algoliaResetService };
