import { configureStore } from '@reduxjs/toolkit';
import alertReducer from './AlertSlice';
import taskReducer from './TaskSlice'

export const store = configureStore({
    reducer: {
        alert: alertReducer,
        task: taskReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
