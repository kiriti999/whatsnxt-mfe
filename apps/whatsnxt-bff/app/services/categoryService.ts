// import mongoose from 'mongoose';
// import { getDatabaseService } from '../../common/databaseService';

// // Import constants - you'll need to move these from your NestJS constants file
// import { BLOG_CATEGORIES } from '../../common/constants';

// class CategoryService {
//     constructor() {
//         this.dbService = getDatabaseService();
//         this.initializeConnection();
//     }

//     async initializeConnection() {
//         try {
//             await this.dbService.ensureConnection();
//             logger.info('✅ CategoryService initialized with database connection');
//         } catch (error) {
//             logger.error('CategoryService :: initializeConnection :: error:', error);
//         }
//     }

//     async ensureConnection() {
//         await this.dbService.ensureConnection();
//     }

//     async getCategories() {
//

//         try {
//             logger.info('CategoryService :: getCategories :: fetching categories');

//             const BlogCategory = mongoose.model('blogCategories');
//             const categories = await BlogCategory.find({}).lean();

//             const result = categories.map(category => ({
//                 _id: category._id.toString(),
//                 categoryName: category.categoryName,
//                 subcategories: category.subcategories?.map(subcategory => ({
//                     name: subcategory.name || subcategory.categoryName, // Handle both field names
//                     subcategories: subcategory.subcategories?.map(nestedSubcategory => ({
//                         name: nestedSubcategory.name || nestedSubcategory.categoryName,
//                     })) || [],
//                 })) || [],
//             }));

//             logger.info(`CategoryService :: getCategories :: found ${result.length} categories`);
//             return result;
//         } catch (error) {
//             logger.error('CategoryService :: getCategories :: error:', error);
//             throw new Error(`Failed to fetch categories: ${error.message}`);
//         }
//     }

//     async getArticleCountByCategory() {
//

//         try {
//             logger.info('CategoryService :: getArticleCountByCategory :: calculating counts');

//             const BlogPost = mongoose.model('blogPosts');

//             const result = await BlogPost.aggregate([
//                 {
//                     $addFields: {
//                         convertedCategoryId: { $toObjectId: "$categoryId" }
//                     }
//                 },
//                 {
//                     $lookup: {
//                         from: "blogcategories", // Note: Mongoose uses lowercase collection names
//                         localField: "convertedCategoryId",
//                         foreignField: "_id",
//                         as: "categoryDetails"
//                     }
//                 },
//                 {
//                     $unwind: "$categoryDetails"
//                 },
//                 {
//                     $group: {
//                         _id: "$categoryDetails._id",
//                         categoryName: { $first: "$categoryDetails.categoryName" },
//                         count: { $sum: 1 }
//                     }
//                 },
//                 {
//                     $project: {
//                         categoryId: "$_id",
//                         _id: 0,
//                         categoryName: 1,
//                         count: 1
//                     }
//                 }
//             ]);

//             logger.info(`CategoryService :: getArticleCountByCategory :: calculated counts for ${result.length} categories`);
//             return result;
//         } catch (error) {
//             logger.error('CategoryService :: getArticleCountByCategory :: error:', error);
//             throw new Error(`Failed to fetch article count by category: ${error.message}`);
//         }
//     }

//     async createCategories() {
//

//         try {
//             logger.info('CategoryService :: createCategories :: creating default categories');

//             const BlogCategory = mongoose.model('blogCategories');

//             // Check if categories already exist
//             const existingCount = await BlogCategory.countDocuments({});
//             if (existingCount > 0) {
//                 logger.info('CategoryService :: createCategories :: categories already exist');
//                 return { message: 'Categories already exist', count: existingCount };
//             }

//             const categories = await BlogCategory.insertMany(BLOG_CATEGORIES);

//             logger.info(`CategoryService :: createCategories :: created ${categories.length} categories`);
//             return categories;
//         } catch (error) {
//             logger.error('CategoryService :: createCategories :: error:', error);
//             throw new Error(`Failed to create categories: ${error.message}`);
//         }
//     }

//     async editCategory(args) {
//

//         try {
//             const { categoryId, categoryName } = args;

//             if (!categoryId || !categoryName) {
//                 throw new Error('Category ID and name are required');
//             }

//             logger.info('CategoryService :: editCategory :: updating category:', categoryId);

//             const BlogCategory = mongoose.model('blogCategories');
//             const BlogPost = mongoose.model('blogPosts');

//             // Update category itself
//             const updatedCategory = await BlogCategory.findByIdAndUpdate(
//                 categoryId,
//                 {
//                     categoryName: categoryName,
//                     updatedAt: new Date()
//                 },
//                 { new: true }
//             ).lean();

//             if (!updatedCategory) {
//                 throw new Error('Category not found');
//             }

//             // Update all posts with this category
//             const updateResult = await BlogPost.updateMany(
//                 { categoryId: categoryId },
//                 {
//                     $set: {
//                         categoryName: categoryName,
//                         updatedAt: new Date()
//                     }
//                 }
//             );

//             logger.info(`CategoryService :: editCategory :: updated ${updateResult.modifiedCount} posts`);

//             return {
//                 ...updatedCategory,
//                 _id: updatedCategory._id.toString()
//             };
//         } catch (error) {
//             logger.error('CategoryService :: editCategory :: error:', error);
//             throw new Error(`Failed to edit category: ${error.message}`);
//         }
//     }

//     async getCategoryById(categoryId) {
//

//         try {
//             if (!categoryId) {
//                 throw new Error('Category ID is required');
//             }

//             logger.info('CategoryService :: getCategoryById :: categoryId:', categoryId);

//             const BlogCategory = mongoose.model('blogCategories');
//             const category = await BlogCategory.findById(categoryId).lean();

//             if (!category) {
//                 return null;
//             }

//             return {
//                 ...category,
//                 _id: category._id.toString()
//             };
//         } catch (error) {
//             logger.error('CategoryService :: getCategoryById :: error:', error);
//             throw new Error(`Failed to fetch category: ${error.message}`);
//         }
//     }

//     async getCategoryByName(categoryName) {
//

//         try {
//             if (!categoryName) {
//                 throw new Error('Category name is required');
//             }

//             logger.info('CategoryService :: getCategoryByName :: categoryName:', categoryName);

//             const BlogCategory = mongoose.model('blogCategories');
//             const category = await BlogCategory.findOne({
//                 categoryName: { $regex: new RegExp(`^${categoryName}$`, 'i') }
//             }).lean();

//             if (!category) {
//                 return null;
//             }

//             return {
//                 ...category,
//                 _id: category._id.toString()
//             };
//         } catch (error) {
//             logger.error('CategoryService :: getCategoryByName :: error:', error);
//             throw new Error(`Failed to fetch category by name: ${error.message}`);
//         }
//     }

//     async createCategory(categoryData) {
//

//         try {
//             const { categoryName, subcategories = [] } = categoryData;

//             if (!categoryName) {
//                 throw new Error('Category name is required');
//             }

//             logger.info('CategoryService :: createCategory :: creating category:', categoryName);

//             // Check if category already exists
//             const existingCategory = await this.getCategoryByName(categoryName);
//             if (existingCategory) {
//                 throw new Error('Category with this name already exists');
//             }

//             const BlogCategory = mongoose.model('blogCategories');
//             const newCategory = await BlogCategory.create({
//                 categoryName,
//                 subcategories,
//                 createdAt: new Date(),
//                 updatedAt: new Date()
//             });

//             logger.info('CategoryService :: createCategory :: category created:', newCategory._id);

//             return {
//                 ...newCategory.toObject(),
//                 _id: newCategory._id.toString()
//             };
//         } catch (error) {
//             logger.error('CategoryService :: createCategory :: error:', error);
//             throw new Error(`Failed to create category: ${error.message}`);
//         }
//     }

//     async deleteCategory(categoryId) {
//

//         try {
//             if (!categoryId) {
//                 throw new Error('Category ID is required');
//             }

//             logger.info('CategoryService :: deleteCategory :: deleting category:', categoryId);

//             // Check if category exists
//             const category = await this.getCategoryById(categoryId);
//             if (!category) {
//                 throw new Error('Category not found');
//             }

//             // Check if category is being used by any posts
//             const BlogPost = mongoose.model('blogPosts');
//             const postsUsingCategory = await BlogPost.countDocuments({
//                 categoryId: categoryId
//             });

//             if (postsUsingCategory > 0) {
//                 throw new Error(`Cannot delete category. ${postsUsingCategory} posts are using this category.`);
//             }

//             // Delete the category
//             const BlogCategory = mongoose.model('blogCategories');
//             const deleteResult = await BlogCategory.findByIdAndDelete(categoryId);

//             if (!deleteResult) {
//                 throw new Error('Failed to delete category');
//             }

//             logger.info('CategoryService :: deleteCategory :: category deleted:', categoryId);

//             return {
//                 success: true,
//                 message: 'Category deleted successfully',
//                 deletedCategory: category
//             };
//         } catch (error) {
//             logger.error('CategoryService :: deleteCategory :: error:', error);
//             throw new Error(`Failed to delete category: ${error.message}`);
//         }
//     }

//     async addSubcategory(categoryId, subcategoryData) {
//

//         try {
//             if (!categoryId) {
//                 throw new Error('Category ID is required');
//             }

//             const { name, subcategories = [] } = subcategoryData;

//             if (!name) {
//                 throw new Error('Subcategory name is required');
//             }

//             logger.info('CategoryService :: addSubcategory :: adding to category:', categoryId);

//             const newSubcategory = {
//                 name: name,
//                 subcategories
//             };

//             const BlogCategory = mongoose.model('blogCategories');
//             const updatedCategory = await BlogCategory.findByIdAndUpdate(
//                 categoryId,
//                 {
//                     $push: { subcategories: newSubcategory },
//                     $set: { updatedAt: new Date() }
//                 },
//                 { new: true }
//             ).lean();

//             if (!updatedCategory) {
//                 throw new Error('Category not found');
//             }

//             logger.info('CategoryService :: addSubcategory :: subcategory added');

//             return {
//                 ...updatedCategory,
//                 _id: updatedCategory._id.toString()
//             };
//         } catch (error) {
//             logger.error('CategoryService :: addSubcategory :: error:', error);
//             throw new Error(`Failed to add subcategory: ${error.message}`);
//         }
//     }

//     async removeSubcategory(categoryId, subcategoryName) {
//

//         try {
//             if (!categoryId || !subcategoryName) {
//                 throw new Error('Category ID and subcategory name are required');
//             }

//             logger.info('CategoryService :: removeSubcategory :: removing from category:', categoryId);

//             const BlogCategory = mongoose.model('blogCategories');
//             const updatedCategory = await BlogCategory.findByIdAndUpdate(
//                 categoryId,
//                 {
//                     $pull: {
//                         subcategories: {
//                             $or: [
//                                 { name: subcategoryName },
//                                 { categoryName: subcategoryName } // Handle legacy field name
//                             ]
//                         }
//                     },
//                     $set: { updatedAt: new Date() }
//                 },
//                 { new: true }
//             ).lean();

//             if (!updatedCategory) {
//                 throw new Error('Category not found');
//             }

//             logger.info('CategoryService :: removeSubcategory :: subcategory removed');

//             return {
//                 ...updatedCategory,
//                 _id: updatedCategory._id.toString()
//             };
//         } catch (error) {
//             logger.error('CategoryService :: removeSubcategory :: error:', error);
//             throw new Error(`Failed to remove subcategory: ${error.message}`);
//         }
//     }

//     async searchCategories(searchTerm) {
//

//         try {
//             logger.info('CategoryService :: searchCategories :: searchTerm:', searchTerm);

//             if (!searchTerm) {
//                 return await this.getCategories();
//             }

//             const BlogCategory = mongoose.model('blogCategories');
//             const categories = await BlogCategory.find({
//                 $or: [
//                     { categoryName: { $regex: searchTerm, $options: 'i' } },
//                     { 'subcategories.name': { $regex: searchTerm, $options: 'i' } },
//                     { 'subcategories.categoryName': { $regex: searchTerm, $options: 'i' } } // Legacy field
//                 ]
//             }).lean();

//             const result = categories.map(category => ({
//                 _id: category._id.toString(),
//                 categoryName: category.categoryName,
//                 subcategories: category.subcategories?.map(subcategory => ({
//                     name: subcategory.name || subcategory.categoryName,
//                     subcategories: subcategory.subcategories?.map(nestedSubcategory => ({
//                         name: nestedSubcategory.name || nestedSubcategory.categoryName,
//                     })) || [],
//                 })) || [],
//             }));

//             logger.info(`CategoryService :: searchCategories :: found ${result.length} matching categories`);
//             return result;
//         } catch (error) {
//             logger.error('CategoryService :: searchCategories :: error:', error);
//             throw new Error(`Failed to search categories: ${error.message}`);
//         }
//     }

//     async getCategoriesWithPostCount() {
//

//         try {
//             logger.info('CategoryService :: getCategoriesWithPostCount :: fetching with counts');

//             const BlogCategory = mongoose.model('blogCategories');

//             const categoriesWithCount = await BlogCategory.aggregate([
//                 {
//                     $lookup: {
//                         from: 'blogposts',
//                         let: { categoryId: { $toString: '$_id' } },
//                         pipeline: [
//                             {
//                                 $match: {
//                                     $expr: { $eq: ['$categoryId', '$$categoryId'] }
//                                 }
//                             }
//                         ],
//                         as: 'posts'
//                     }
//                 },
//                 {
//                     $addFields: {
//                         postCount: { $size: '$posts' }
//                     }
//                 },
//                 {
//                     $project: {
//                         posts: 0 // Remove the posts array, keep only the count
//                     }
//                 },
//                 {
//                     $sort: { categoryName: 1 }
//                 }
//             ]);

//             const result = categoriesWithCount.map(category => ({
//                 _id: category._id.toString(),
//                 categoryName: category.categoryName,
//                 postCount: category.postCount,
//                 subcategories: category.subcategories?.map(subcategory => ({
//                     name: subcategory.name || subcategory.categoryName,
//                     subcategories: subcategory.subcategories?.map(nestedSubcategory => ({
//                         name: nestedSubcategory.name || nestedSubcategory.categoryName,
//                     })) || [],
//                 })) || [],
//             }));

//             logger.info(`CategoryService :: getCategoriesWithPostCount :: found ${result.length} categories with counts`);
//             return result;
//         } catch (error) {
//             logger.error('CategoryService :: getCategoriesWithPostCount :: error:', error);
//             throw new Error(`Failed to fetch categories with post count: ${error.message}`);
//         }
//     }

//     // Utility method to validate category structure
//     validateCategoryStructure(categoryData) {
//         const errors = [];

//         if (!categoryData.categoryName || typeof categoryData.categoryName !== 'string') {
//             errors.push('Category name is required and must be a string');
//         }

//         if (categoryData.subcategories && !Array.isArray(categoryData.subcategories)) {
//             errors.push('Subcategories must be an array');
//         }

//         if (categoryData.subcategories) {
//             categoryData.subcategories.forEach((subcategory, index) => {
//                 const subcatName = subcategory.name || subcategory.categoryName;
//                 if (!subcatName || typeof subcatName !== 'string') {
//                     errors.push(`Subcategory at index ${index} must have a valid name`);
//                 }
//             });
//         }

//         return {
//             isValid: errors.length === 0,
//             errors
//         };
//     }

//     // Bulk operations
//     async bulkCreateCategories(categoriesData) {
//

//         try {
//             logger.info(`CategoryService :: bulkCreateCategories :: creating ${categoriesData.length} categories`);

//             const validCategories = [];
//             const errors = [];

//             categoriesData.forEach((categoryData, index) => {
//                 const validation = this.validateCategoryStructure(categoryData);
//                 if (validation.isValid) {
//                     validCategories.push({
//                         ...categoryData,
//                         createdAt: new Date(),
//                         updatedAt: new Date()
//                     });
//                 } else {
//                     errors.push({
//                         index,
//                         errors: validation.errors
//                     });
//                 }
//             });

//             if (errors.length > 0) {
//                 throw new Error(`Validation errors: ${JSON.stringify(errors)}`);
//             }

//             const BlogCategory = mongoose.model('blogCategories');
//             const result = await BlogCategory.insertMany(validCategories);

//             logger.info(`CategoryService :: bulkCreateCategories :: created ${result.length} categories`);

//             return {
//                 success: true,
//                 insertedCount: result.length,
//                 insertedIds: result.map(cat => cat._id.toString()),
//                 categories: result
//             };
//         } catch (error) {
//             logger.error('CategoryService :: bulkCreateCategories :: error:', error);
//             throw new Error(`Failed to bulk create categories: ${error.message}`);
//         }
//     }

//     async updateCategoryOrder(categoryIds) {
//

//         try {
//             logger.info('CategoryService :: updateCategoryOrder :: updating order for categories');

//             const BlogCategory = mongoose.model('blogCategories');
//             const updatePromises = categoryIds.map((categoryId, index) =>
//                 BlogCategory.findByIdAndUpdate(
//                     categoryId,
//                     {
//                         order: index,
//                         updatedAt: new Date()
//                     }
//                 )
//             );

//             await Promise.all(updatePromises);

//             logger.info('CategoryService :: updateCategoryOrder :: order updated');
//             return { success: true, message: 'Category order updated successfully' };
//         } catch (error) {
//             logger.error('CategoryService :: updateCategoryOrder :: error:', error);
//             throw new Error(`Failed to update category order: ${error.message}`);
//         }
//     }

//     // Get service information
//     getServiceInfo() {
//         return {
//             service: 'CategoryService',
//             features: [
//                 'category_management',
//                 'subcategory_management',
//                 'category_search',
//                 'post_count_tracking',
//                 'bulk_operations'
//             ],
//             supportedOperations: [
//                 'create', 'read', 'update', 'delete',
//                 'search', 'bulk_create', 'reorder'
//             ],
//             databaseType: 'mongoose'
//         };
//     }
// }

// // Create singleton instance
// const categoryService = new CategoryService();

// export {
//     CategoryService,
//     categoryService
// };

import mongoose from "mongoose";
import { BLOG_CATEGORIES } from "../common/constants";
import { getLogger } from "../../config/logger";
const logger = getLogger("categoryService");

class CategoryService {
  async getCategories() {
    try {
      const BlogCategory = mongoose.model("blogCategories");
      const categories = await BlogCategory.find({}).lean();
      return categories.map((category) => ({
        _id: category._id.toString(),
        categoryName: category.categoryName,
        subcategories: (category.subcategories || []).map((subcategory) => ({
          name: subcategory.name || subcategory.categoryName,
          subcategories: (subcategory.subcategories || []).map((nested) => ({
            name: nested.name || nested.categoryName,
          })),
        })),
      }));
    } catch (error) {
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }
  }

  async getArticleCountByCategory() {
    try {
      const BlogPost = mongoose.model("blogPosts");
      const result = await BlogPost.aggregate([
        { $addFields: { convertedCategoryId: { $toObjectId: "$categoryId" } } },
        {
          $lookup: {
            from: "blogCategories",
            localField: "convertedCategoryId",
            foreignField: "_id",
            as: "categoryDetails",
          },
        },
        { $unwind: "$categoryDetails" },
        {
          $group: {
            _id: "$categoryDetails._id",
            categoryName: { $first: "$categoryDetails.categoryName" },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            categoryId: "$_id",
            _id: 0,
            categoryName: 1,
            count: 1,
          },
        },
      ]);
      return result;
    } catch (error) {
      throw new Error(
        `Failed to fetch article count by category: ${error.message}`,
      );
    }
  }

  async createCategories() {
    try {
      const BlogCategory = mongoose.model("blogCategories");
      const existingCount = await BlogCategory.countDocuments({});
      if (existingCount > 0) {
        return { message: "Categories already exist", count: existingCount };
      }
      const categories = await BlogCategory.insertMany(BLOG_CATEGORIES);
      return categories;
    } catch (error) {
      throw new Error(`Failed to create categories: ${error.message}`);
    }
  }

  async editCategory({ categoryId, categoryName }) {
    try {
      if (!categoryId || !categoryName)
        throw new Error("Category ID and name are required");
      const BlogCategory = mongoose.model("blogCategories");
      const BlogPost = mongoose.model("blogPosts");
      const updatedCategory = await BlogCategory.findByIdAndUpdate(
        categoryId,
        { categoryName, updatedAt: new Date() },
        { new: true },
      ).lean();
      if (!updatedCategory) throw new Error("Category not found");
      await BlogPost.updateMany(
        { categoryId },
        { $set: { categoryName, updatedAt: new Date() } },
      );
      return {
        ...(updatedCategory as any),
        _id: (updatedCategory as any)._id.toString(),
      };
    } catch (error) {
      throw new Error(`Failed to edit category: ${error.message}`);
    }
  }

  async getCategoryById(categoryId) {
    try {
      if (!categoryId) throw new Error("Category ID is required");
      const BlogCategory = mongoose.model("blogCategories");
      const category = await BlogCategory.findById(categoryId).lean();
      if (!category) return null;
      return { ...(category as any), _id: (category as any)._id.toString() };
    } catch (error) {
      throw new Error(`Failed to fetch category: ${error.message}`);
    }
  }

  async getCategoryByName(categoryName) {
    try {
      if (!categoryName) throw new Error("Category name is required");
      const BlogCategory = mongoose.model("blogCategories");
      const category = await BlogCategory.findOne({
        categoryName: { $regex: new RegExp(`^${categoryName}$`, "i") },
      }).lean();
      if (!category) return null;
      return { ...(category as any), _id: (category as any)._id.toString() };
    } catch (error) {
      throw new Error(`Failed to fetch category by name: ${error.message}`);
    }
  }

  async createCategory({ categoryName, subcategories = [] }) {
    try {
      if (!categoryName) throw new Error("Category name is required");
      const existingCategory = await this.getCategoryByName(categoryName);
      if (existingCategory)
        throw new Error("Category with this name already exists");
      const BlogCategory = mongoose.model("blogCategories");
      const newCategory = await BlogCategory.create({
        categoryName,
        subcategories,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return { ...newCategory.toObject(), _id: newCategory._id.toString() };
    } catch (error) {
      throw new Error(`Failed to create category: ${error.message}`);
    }
  }

  async deleteCategory(categoryId) {
    try {
      if (!categoryId) throw new Error("Category ID is required");
      const BlogCategory = mongoose.model("blogCategories");
      const BlogPost = mongoose.model("blogPosts");
      const postsUsingCategory = await BlogPost.countDocuments({ categoryId });
      if (postsUsingCategory > 0)
        throw new Error(
          `Cannot delete category. ${postsUsingCategory} posts are using this category.`,
        );
      const deleted = await BlogCategory.findByIdAndDelete(categoryId);
      if (!deleted) throw new Error("Failed to delete category");
      return { success: true, message: "Category deleted successfully" };
    } catch (error) {
      throw new Error(`Failed to delete category: ${error.message}`);
    }
  }

  async addSubcategory(categoryId, { name, subcategories = [] }) {
    try {
      if (!categoryId || !name)
        throw new Error("Category ID and subcategory name are required");
      const BlogCategory = mongoose.model("blogCategories");
      const updatedCategory = await BlogCategory.findByIdAndUpdate(
        categoryId,
        {
          $push: { subcategories: { name, subcategories } },
          $set: { updatedAt: new Date() },
        },
        { new: true },
      ).lean();
      if (!updatedCategory) throw new Error("Category not found");
      return {
        ...(updatedCategory as any),
        _id: (updatedCategory as any)._id.toString(),
      };
    } catch (error) {
      throw new Error(`Failed to add subcategory: ${error.message}`);
    }
  }

  async removeSubcategory(categoryId, subcategoryName) {
    try {
      if (!categoryId || !subcategoryName)
        throw new Error("Category ID and subcategory name are required");
      const BlogCategory = mongoose.model("blogCategories");
      const updatedCategory = await BlogCategory.findByIdAndUpdate(
        categoryId,
        {
          $pull: {
            subcategories: {
              $or: [
                { name: subcategoryName },
                { categoryName: subcategoryName },
              ],
            },
          },
          $set: { updatedAt: new Date() },
        },
        { new: true },
      ).lean();
      if (!updatedCategory) throw new Error("Category not found");
      return {
        ...(updatedCategory as any),
        _id: (updatedCategory as any)._id.toString(),
      };
    } catch (error) {
      throw new Error(`Failed to remove subcategory: ${error.message}`);
    }
  }

  async searchCategories(searchTerm) {
    try {
      logger.info(
        "CategoryService :: searchCategories :: searchTerm:",
        searchTerm,
      );

      if (!searchTerm) {
        return await this.getCategories();
      }

      const BlogCategory = mongoose.model("blogCategories");
      const categories = await BlogCategory.find({
        $or: [
          { categoryName: { $regex: searchTerm, $options: "i" } },
          { "subcategories.name": { $regex: searchTerm, $options: "i" } },
          {
            "subcategories.categoryName": { $regex: searchTerm, $options: "i" },
          }, // Legacy field
        ],
      }).lean();

      const result = categories.map((category) => ({
        _id: category._id.toString(),
        categoryName: category.categoryName,
        subcategories:
          category.subcategories?.map((subcategory) => ({
            name: subcategory.name || subcategory.categoryName,
            subcategories:
              subcategory.subcategories?.map((nestedSubcategory) => ({
                name: nestedSubcategory.name || nestedSubcategory.categoryName,
              })) || [],
          })) || [],
      }));

      logger.info(
        `CategoryService :: searchCategories :: found ${result.length} matching categories`,
      );
      return result;
    } catch (error) {
      logger.error("CategoryService :: searchCategories :: error:", error);
      throw new Error(`Failed to search categories: ${error.message}`);
    }
  }

  async getCategoriesWithPostCount() {
    try {
      logger.info(
        "CategoryService :: getCategoriesWithPostCount :: fetching with counts",
      );

      const BlogCategory = mongoose.model("blogCategories");

      const categoriesWithCount = await BlogCategory.aggregate([
        {
          $lookup: {
            from: "blogposts",
            let: { categoryId: { $toString: "$_id" } },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$categoryId", "$$categoryId"] },
                },
              },
            ],
            as: "posts",
          },
        },
        {
          $addFields: {
            postCount: { $size: "$posts" },
          },
        },
        {
          $project: {
            posts: 0, // Remove the posts array, keep only the count
          },
        },
        {
          $sort: { categoryName: 1 },
        },
      ]);

      const result = categoriesWithCount.map((category) => ({
        _id: category._id.toString(),
        categoryName: category.categoryName,
        postCount: category.postCount,
        subcategories:
          category.subcategories?.map((subcategory) => ({
            name: subcategory.name || subcategory.categoryName,
            subcategories:
              subcategory.subcategories?.map((nestedSubcategory) => ({
                name: nestedSubcategory.name || nestedSubcategory.categoryName,
              })) || [],
          })) || [],
      }));

      logger.info(
        `CategoryService :: getCategoriesWithPostCount :: found ${result.length} categories with counts`,
      );
      return result;
    } catch (error) {
      logger.error(
        "CategoryService :: getCategoriesWithPostCount :: error:",
        error,
      );
      throw new Error(
        `Failed to fetch categories with post count: ${error.message}`,
      );
    }
  }

  // Utility method to validate category structure
  validateCategoryStructure(categoryData) {
    const errors = [];

    if (
      !categoryData.categoryName ||
      typeof categoryData.categoryName !== "string"
    ) {
      errors.push("Category name is required and must be a string");
    }

    if (
      categoryData.subcategories &&
      !Array.isArray(categoryData.subcategories)
    ) {
      errors.push("Subcategories must be an array");
    }

    if (categoryData.subcategories) {
      categoryData.subcategories.forEach((subcategory, index) => {
        const subcatName = subcategory.name || subcategory.categoryName;
        if (!subcatName || typeof subcatName !== "string") {
          errors.push(`Subcategory at index ${index} must have a valid name`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Bulk operations
  async bulkCreateCategories(categoriesData) {
    try {
      logger.info(
        `CategoryService :: bulkCreateCategories :: creating ${categoriesData.length} categories`,
      );

      const validCategories = [];
      const errors = [];

      categoriesData.forEach((categoryData, index) => {
        const validation = this.validateCategoryStructure(categoryData);
        if (validation.isValid) {
          validCategories.push({
            ...categoryData,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        } else {
          errors.push({
            index,
            errors: validation.errors,
          });
        }
      });

      if (errors.length > 0) {
        throw new Error(`Validation errors: ${JSON.stringify(errors)}`);
      }

      const BlogCategory = mongoose.model("blogCategories");
      const result = await BlogCategory.insertMany(validCategories);

      logger.info(
        `CategoryService :: bulkCreateCategories :: created ${result.length} categories`,
      );

      return {
        success: true,
        insertedCount: result.length,
        insertedIds: result.map((cat) => cat._id.toString()),
        categories: result,
      };
    } catch (error) {
      logger.error("CategoryService :: bulkCreateCategories :: error:", error);
      throw new Error(`Failed to bulk create categories: ${error.message}`);
    }
  }

  async updateCategoryOrder(categoryIds) {
    try {
      logger.info(
        "CategoryService :: updateCategoryOrder :: updating order for categories",
      );

      const BlogCategory = mongoose.model("blogCategories");
      const updatePromises = categoryIds.map((categoryId, index) =>
        BlogCategory.findByIdAndUpdate(categoryId, {
          order: index,
          updatedAt: new Date(),
        }),
      );

      await Promise.all(updatePromises);

      logger.info("CategoryService :: updateCategoryOrder :: order updated");
      return { success: true, message: "Category order updated successfully" };
    } catch (error) {
      logger.error("CategoryService :: updateCategoryOrder :: error:", error);
      throw new Error(`Failed to update category order: ${error.message}`);
    }
  }

  // Get service information
  getServiceInfo() {
    return {
      service: "CategoryService",
      features: [
        "category_management",
        "subcategory_management",
        "category_search",
        "post_count_tracking",
        "bulk_operations",
      ],
      supportedOperations: [
        "create",
        "read",
        "update",
        "delete",
        "search",
        "bulk_create",
        "reorder",
      ],
      databaseType: "mongoose",
    };
  }
}

const categoryService = new CategoryService();
export { CategoryService, categoryService };
