export type ContentType = 'blog' | 'tutorial' | '';

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
  cloudinaryAssets?: { publicId: string; resource_type: string }[]
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

export interface EditCategoryFormData {
  categoryName: string;

  backgroundColor: string;
  fontColor: string;
}
