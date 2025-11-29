export interface Review {
  $id: string;
  productId: string; // UUID от Appwrite
  userId: string; // UUID от Appwrite
  rating: number;
  comment: string;
  isAnonymous: boolean;
  userName: string | null;
  userEmail: string | null;
  $createdAt: string;
  $updatedAt: string;
}

export interface ReviewWithMedia extends Review {
  media: readonly ReviewMedia[];
}

export interface ReviewMedia {
  $id: string;
  reviewId: string; // UUID отзыва
  fileId: string; // UUID файла
  fileName: string;
  mimeType: string;
  fileSize: number;
  mediaType: "image" | "video";
  uploadedAt: string;
  $createdAt: string;
  $updatedAt: string;
}

export interface CreateReviewInput {
  productId: string;
  rating: number;
  comment: string;
  isAnonymous: boolean;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}
