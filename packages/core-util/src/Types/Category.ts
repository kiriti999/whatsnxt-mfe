export type Category = { categoryName: string; count?: number; subcategories?: Category[] };

export type CategoryListResponse = {
  categories: Category[];
}