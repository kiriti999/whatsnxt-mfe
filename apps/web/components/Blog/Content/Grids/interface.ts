// ✅ Type-safe interfaces for your card components
export interface ITutorialCard {
    tutorial: ContentItem; // Now ContentItem has all required fields
}

export interface IBlogCard {
    blog: ContentItem; // Now ContentItem has all required fields
}

export interface ContentItem {
    _id?: string;
    id?: string;
    title: string;
    slug: string;
    categoryName: string;
    imageUrl: string;
    listed: boolean;
    tutorial?: boolean; // This determines if it's a tutorial or blog
    // Add other common fields
    description?: string;
    updatedAt?: string;
    published?: boolean;
    userId?: string;
    categoryId?: string;
    subCategory?: string;
    nestedSubCategory?: string;
    tutorials?: Array<{
        title: string;
        description: string;
    }>;
    contentFormat?: string;
    timeToRead?: string;
    cloudinaryAssets?: any[];
    [key: string]: any; // For any additional fields
}