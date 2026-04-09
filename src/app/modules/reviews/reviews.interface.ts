import { ReviewStatus } from "../../../../generated/prisma";




export interface ICreateReview {
    rating: number;
    content: string;
    tags: string[];
    hasSpoiler?: boolean;
}

export interface IUpdateReview {
    rating?: number;
    content?: string;
    tags?: string[];
    hasSpoiler?: boolean;
}