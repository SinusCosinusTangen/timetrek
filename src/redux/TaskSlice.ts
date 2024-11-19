import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import User from '../model/User';

interface TaskState {
    pageId: string;
    maker: User | null;
    members: User[];
    type: 'ADD' | 'UPDATE' | 'DELETE';
    visible: boolean;
}

const initialState: TaskState = {
    pageId: '',
    maker: null,
    members: [],
    type: 'ADD',
    visible: false,
};

const taskSlice = createSlice({
    name: 'task',
    initialState,
    reducers: {
        showTaskForm: (state, action: PayloadAction<{ pageId: string; maker: User; members: User[]; type: TaskState['type']; }>) => {
            state.pageId = action.payload.pageId;
            state.maker = {
                ...action.payload.maker,
                LastLoggedIn: action.payload.maker.LastLoggedIn instanceof Date
                    ? action.payload.maker.LastLoggedIn.toISOString()
                    : action.payload.maker.LastLoggedIn
            };
            state.members = action.payload.members;
            state.type = action.payload.type;
            state.visible = true;
        },
        hideTaskForm: (state) => {
            state.visible = false;
            state.pageId = '';
            state.maker = null;
            state.members = [];
        },
    },
});

export const { showTaskForm, hideTaskForm } = taskSlice.actions;
export default taskSlice.reducer;
