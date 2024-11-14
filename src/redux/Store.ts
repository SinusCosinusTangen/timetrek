import { configureStore } from '@reduxjs/toolkit';
import alertReducer from './AlertSlice';

export const store = configureStore({
    reducer: {
        alert: alertReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
