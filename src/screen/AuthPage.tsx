import SignUp from "../components/SignUp";
import { useState, useEffect } from "react";
import { SIGNIN, SIGNUP } from "../constant/Constant";
import SignIn from "../components/SignIn";
import img from "../asset/img/5243321.png";
import { auth } from "../config/Firebase";
import { getUserByUid } from "../service/Auth";
import { useNavigate } from "react-router-dom";
import User from "../model/User";

const AuthPage = () => {
    const navigate = useNavigate();
    const [authForm, setAuthForm] = useState(SIGNIN);
    const [user, setUser] = useState<User>();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
            if (currentUser?.uid) {
                const user = await getUserByUid(currentUser?.uid);

                if (user) {
                    if (currentUser.photoURL) {
                        user.PhotoUrl = currentUser.photoURL;
                    }
                    setUser(user);
                }
            }
            if (currentUser) {
                navigate("/");
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="flex">
            <div className="flex-auto h-screen w-3/5 px-52 flex flex-col">
                <div className="flex-grow flex items-center">
                    <div className="w-full">
                        <h1 className="text-4xl text-center">Welcome to TimeTrek</h1>
                        {authForm === SIGNUP ? <SignUp /> : <SignIn />}
                    </div>
                </div>
                {authForm === SIGNIN && (
                    <div className="flex justify-center mb-12">
                        <p className="flex-row mr-1">Don't have an account?</p>
                        <button className="flex-row text-blue-500 hover:underline" onClick={() => setAuthForm(SIGNUP)}>Sign Up</button>
                    </div>
                )}
                {authForm === SIGNUP && (
                    <div className="flex justify-center mb-12">
                        <p className="flex-row mr-1">Already have an account?</p>
                        <button className="flex-row text-blue-500 hover:underline" onClick={() => setAuthForm(SIGNIN)}>Sign In</button>
                    </div>
                )}
            </div>
            <div className="flex-auto flex justify-center items-center bg-zinc-100 w-2/5 p-4">
                <img src={img} width={280}></img>
            </div>
        </div>
    );
};

export default AuthPage;
