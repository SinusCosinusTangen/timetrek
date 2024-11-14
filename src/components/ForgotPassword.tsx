import React, { useState } from "react";
import { EMAILREGEX } from "../constant/Constant";
import { auth } from "../config/Firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../redux/Store";
import { showAlert } from "../redux/AlertSlice";
import { useNavigate } from "react-router-dom";

interface ForgotPasswordProps {
    emailInput?: string;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ emailInput }) => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const [emailValid, setEmailValid] = useState(true);
    const [email, setEmail] = useState(emailInput ? emailInput : "");

    const validateEmail = (input: string) => {
        setEmailValid(EMAILREGEX.test(input));
    }

    const handleResetPassword = async () => {
        sendPasswordResetEmail(auth, email)
            .then(() => {
                dispatch(showAlert({ message: "Reset password link already sent to your email!", type: 'info', action: () => { navigate("/auth"); } }));
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                dispatch(showAlert({ message: errorMessage, type: 'error', action: () => { navigate("/auth"); } }));
            });
    }

    return (
        <div>
            <div>
                <form
                    className="flex flex-col mt-4 mb-2"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleResetPassword();
                    }}
                >
                    <label>Email</label>
                    <input className={`flex-row border border-black px-2 py-1 rounded focus:outline-none focus:ring-1 ${emailValid ? 'focus:border-blue-500 focus:ring-blue-500' : 'border-pink-500 focus:border-pink-500 focus:ring-pink-500'}`} placeholder="Enter your email" value={email} onChange={(e) => { const newEmail = e.target.value; setEmail(newEmail); validateEmail(newEmail); }} onBlur={() => validateEmail(email)} />
                    {!emailValid && (
                        <label className="text-pink-600 text-xs">Please enter a valid email address</label>
                    )}

                    <button className="p-2 bg-blue-500 text-white rounded mt-2 hover:bg-blue-700 active:scale-95 transition-transform duration-200">Reset Password</button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
