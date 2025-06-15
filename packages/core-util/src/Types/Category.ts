export type Category = { name: string; count?: number; subcategories?: Category[] };

export type CategoryListResponse = {
  categories: Category[];
}