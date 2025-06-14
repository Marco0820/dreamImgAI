export interface User {
    id: number;
    username: string | null;
    email: string;
    is_active: boolean;
    avatar: string | null;
    bio: string | null;
    stripe_customer_id: string | null;
    created_at: string;
    subscription?: any;
}

export interface Image {
    id: number;
    prompt: string;
    model: string;
    image_url: string;
    created_at: string;
    is_shared: boolean;
    owner_id: number;
}

export interface CommunityImage extends Image {
    owner: User;
    favorited: boolean;
    favorites_count: number;
    caption?: string;
} 