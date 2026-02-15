export interface IMemoStore {
    categoryCount: ICategory[];
    loading: boolean;
    error: string;
}

export interface ICategory {
    categoryId?: string;
    categoryName: string;
    count: number;
}