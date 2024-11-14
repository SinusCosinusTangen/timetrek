// Alert.tsx
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/Store';
import { hideAlert } from '../redux/AlertSlice';
import { tick, times } from 'react-icons-kit/typicons';
import Icon from 'react-icons-kit';

const Alert: React.FC = () => {
    const { message, type, visible, action } = useSelector((state: RootState) => state.alert);
    const dispatch = useDispatch<AppDispatch>();
    const icon = type === "error" ? times : tick;
    const iconClass = type === "error" ? "text-pink-600" : "text-green-600";
    const colorClass = type === "error" ? "border-pink-600 bg-pink-100/50 shadow-pink-500/30" : "border-green-600 bg-green-100/50 shadow-green-500/30"

    if (!visible) return null;

    return (
        <div className="fixed z-50 inset-0 bg-slate-700/60 flex items-center justify-center transition-opacity">
            <div className="m-auto w-fit p-6 bg-white shadow-2xl rounded-xl transform transition-all duration-300 ease-out" onClick={(e) => e.stopPropagation()}>
                <div className="flex flex-col items-center gap-6">
                    <div className={`flex items-center justify-center w-16 h-16 border-2 rounded-full shadow-lg ${colorClass}`}>
                        <Icon icon={icon} className={iconClass} size={40} />
                    </div>
                    <div className="text-center px-4 text-gray-700 font-medium text-lg">
                        {message}
                    </div>
                    <div className="w-full flex justify-center">
                        <button
                            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg py-2 px-5 hover:bg-blue-700 hover:shadow-lg active:scale-95 transition-transform"
                            onClick={() => { dispatch(hideAlert()); action(); }}
                        >
                            OK
                        </button>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default Alert;
