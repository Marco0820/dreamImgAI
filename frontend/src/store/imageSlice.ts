import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import api from '../lib/api'; // Corrected path
import axios from 'axios';
import { RootState } from '.';

// Type for a single generated image - corrected field name
export interface GeneratedImage {
  id: number;
  image_url: string; // Corrected field name
  prompt: string;
  created_at: string;
}

// The state for this slice
export interface ImageState {
    generatedImages: GeneratedImage[];
    loading: boolean;
    error: string | null;
    generating: boolean;
    history: any[];
    parameters: { [key: string]: any };
}

const initialState: ImageState = {
    generatedImages: [],
    loading: false,
    error: null,
    generating: false,
    history: [],
    parameters: {},
};

// Async thunk for generating an image - now accepts token
export const generateImage = createAsyncThunk(
  'image/generateImage',
  async (
    { prompt, negative_prompt, model, parameters, token }: { 
      prompt: string; 
      negative_prompt?: string; 
      model: string; 
      parameters?: { [key: string]: any };
      token: string | null;
    },
    { dispatch, rejectWithValue }
  ) => {
    try {
      // Use the 'api' instance which should have Authorization headers set
      const response = await api.post('/images/generate', {
        prompt,
        negative_prompt,
        model,
        parameters,
      });
      const generatedImages = response.data;
      dispatch(addImageToHistory(generatedImages[0]));
      return generatedImages;
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || error.message || 'An unknown error occurred';
      return rejectWithValue(errorMsg);
    }
  }
);

export const fetchHistory = createAsyncThunk(
    'image/fetchHistory',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/images/history'); // Use api instance
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.detail || 'Failed to fetch history');
        }
    }
);

const imageSlice = createSlice({
    name: 'image',
    initialState,
    reducers: {
        startImageGeneration: (state) => {
            state.generating = true;
            state.error = null;
        },
        imageGenerationSuccess: (state, action: PayloadAction<any[]>) => {
            state.generating = false;
            state.generatedImages = action.payload;
        },
        imageGenerationFailure: (state, action: PayloadAction<string>) => {
            state.generating = false;
            state.error = action.payload;
        },
        addImageToHistory: (state, action: PayloadAction<any>) => {
            state.history.unshift(action.payload);
        },
        setParameters: (state, action: PayloadAction<{ [key: string]: any }>) => {
            state.parameters = { ...state.parameters, ...action.payload };
        },
        clearGeneratedImages: (state) => {
            state.generatedImages = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(generateImage.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(generateImage.fulfilled, (state, action: PayloadAction<GeneratedImage[]>) => {
                state.loading = false;
                state.generatedImages = action.payload;
                toast.success('Images generated successfully!');
            })
            .addCase(generateImage.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                toast.error(`Error: ${state.error}`);
            })
            .addCase(fetchHistory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchHistory.fulfilled, (state, action: PayloadAction<any[]>) => {
                state.loading = false;
                state.history = action.payload;
            })
            .addCase(fetchHistory.rejected, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { startImageGeneration, imageGenerationSuccess, imageGenerationFailure, addImageToHistory, setParameters, clearGeneratedImages } = imageSlice.actions;
export default imageSlice.reducer;

export const selectImageLoading = (state: RootState) => state.image.loading;
export const selectImageError = (state: RootState) => state.image.error;
export const selectLatestGeneration = (state: RootState) => state.image.generatedImages; 