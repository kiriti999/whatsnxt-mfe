export type ContentType = 'blog' | 'tutorial' | 'both';

export interface Category {
  _id: string;
  categoryName: string;
  subcategories?: SubCategory[];
}

export interface SubCategory {
  name: string;
  subcategories?: SubCategory[];
}

export interface Tutorial {
  title: string;
  description: string;
  cloudinaryAssets?: { public_id: string; resource_type: string }[]
}

export interface Detail {
  title: string;
  categoryId: string;
  categoryName: string;
  subCategory: string;
  nestedSubCategory: string;
  published: boolean;
}

export interface CategoryData {
  imageUrl: string;
  text: string;
}

