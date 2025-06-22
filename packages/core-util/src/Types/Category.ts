// Fixed types to match your Mongoose schema structure

// SubSubCategory type (deepest level - just has name)
export type SubSubCategory = {
  name: string;
};

// SubCategory type (matches your subCategorySchema)
export type SubCategory = {
  name: string;
  count?: number;
  subcategories?: SubSubCategory[]; // Changed from nestedSubcategories to subcategories, and proper typing
};

// Category type (matches your blogCategorySchema)
export type Category = {
  categoryName: string;
  count?: number;
  subcategories?: SubCategory[]; // This should be SubCategory[], not Category[] to avoid infinite recursion
};

// Response type
export type CategoryListResponse = {
  categories: Category[];
}