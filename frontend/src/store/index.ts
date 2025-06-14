import { configureStore } from '@reduxjs/toolkit';
import imageReducer from './imageSlice';
import authReducer from './authSlice';
import communityReducer from './communitySlice';

const store = configureStore({
  reducer: {
    image: imageReducer,
    auth: authReducer,
    community: communityReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store; 