export type Category =
  | "All"
  | "Temple"
  | "Beach"
  | "Nature"
  | "Waterfall"
  | "Market"
  | "Museum";

export interface Image {
  id: string;
  url: string;
}

export interface Accommodation {
  id: string;
  name: string;
  type: string;
  priceRange: string;
  bookingUrl: string | null;
}

export interface Food {
  id: string;
  name: string;
  type: string;
  priceRange: string;
}

export interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: {
    name: string | null;
    image: string | null;
  };
}

export interface Place {
  id: string;
  name: string;
  nameKh: string | null;
  description: string | null;
  lat: number;
  lng: number;
  category: Category;
  province: string;
  isVerified: boolean;
  images: string[];
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  featuredUntil: string | null;
  updatedAt?: string;
  accommodations?: Accommodation[];
  foods?: Food[];
  reviews?: Review[];
}
