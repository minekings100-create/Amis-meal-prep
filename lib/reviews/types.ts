export const REVIEW_EDIT_WINDOW_MS = 24 * 60 * 60 * 1000;

export interface ReviewEligibility {
  signedIn: boolean;
  verifiedBuyer: boolean;
  /** Existing review (any state) by this customer for this product, if any. */
  existing: {
    id: string;
    rating: number;
    title: string | null;
    body: string | null;
    isPublished: boolean;
    isDeleted: boolean;
    createdAt: string;
    isEditable: boolean;
  } | null;
}
