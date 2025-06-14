import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { CommunityImage } from '../types'; // Assuming you have a types file

interface CommunityState {
    images: CommunityImage[];
    loading: boolean;
    error: string | null;
    captionStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
    captions: { [key: number]: string };
}

const initialState: CommunityState = {
    images: [],
    loading: false,
    error: null,
    captionStatus: 'idle',
    captions: {},
};

export const fetchCommunityImages = createAsyncThunk<CommunityImage[], void, { rejectValue: string }>(
    'community/fetchCommunityImages',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch('/api/community/images/');
            if (!response.ok) {
                return rejectWithValue('Failed to fetch community images');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue('An unknown error occurred');
        }
    }
);

export const toggleFavorite = createAsyncThunk<
    { imageId: number, favorited: boolean },
    { imageId: number, favorited: boolean, token: string },
    { rejectValue: string }
>(
    'community/toggleFavorite',
    async ({ imageId, favorited, token }, { rejectWithValue }) => {
        const endpoint = favorited ? `/api/images/${imageId}/unfavorite` : `/api/images/${imageId}/favorite`;
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.detail || 'Failed to toggle favorite');
            }
            return { imageId, favorited: !favorited };
        } catch (error) {
            return rejectWithValue('An unknown error occurred while toggling favorite');
        }
    }
);

export const generateCaption = createAsyncThunk<
    { imageId: number; caption: string },
    { imageId: number; token: string },
    { rejectValue: string }
>('community/generateCaption', async ({ imageId, token }, { rejectWithValue }) => {
    try {
        const response = await fetch('/api/images/generate-caption/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ image_id: imageId }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            return rejectWithValue(errorData.detail || 'Failed to generate caption');
        }

        const data = await response.json();
        return { imageId, caption: data.caption };
    } catch (error) {
        return rejectWithValue('An unknown error occurred');
    }
});

const communitySlice = createSlice({
    name: 'community',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCommunityImages.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCommunityImages.fulfilled, (state, action: PayloadAction<CommunityImage[]>) => {
                state.loading = false;
                state.images = action.payload;
            })
            .addCase(fetchCommunityImages.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Optimistic update for toggleFavorite
            .addCase(toggleFavorite.fulfilled, (state, action: PayloadAction<{ imageId: number, favorited: boolean }>) => {
                const image = state.images.find(i => i.id === action.payload.imageId);
                if (image) {
                    image.favorited_by_user = action.payload.favorited;
                }
            })
            .addCase(generateCaption.pending, (state) => {
                state.captionStatus = 'loading';
            })
            .addCase(generateCaption.fulfilled, (state, action: PayloadAction<{ imageId: number, caption: string }>) => {
                state.captionStatus = 'succeeded';
                state.captions[action.payload.imageId] = action.payload.caption;
            })
            .addCase(generateCaption.rejected, (state) => {
                state.captionStatus = 'failed';
            });
    },
});

export default communitySlice.reducer; 