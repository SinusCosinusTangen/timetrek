import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AlertState {
    message: string;
    type: 'info' | 'success' | 'error';
    visible: boolean;
    action: any;
}

const initialState: AlertState = {
    message: '',
    type: 'info',
    visible: false,
    action: () => { },
};

const alertSlice = createSlice({
    name: 'alert',
    initialState,
    reducers: {
        showAlert: (state, action: PayloadAction<{ message: string; type: AlertState['type']; action: any }>) => {
            state.message = action.payload.message;
            state.type = action.payload.type;
            state.visible = true;
            state.action = action.payload.action;
        },
        hideAlert: (state) => {
            state.visible = false;
            state.message = '';
        },
    },
});

export const { showAlert, hideAlert } = alertSlice.actions;
export default alertSlice.reducer;
