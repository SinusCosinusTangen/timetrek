import { useState } from "react";
import { EMAILREGEX, FORGOTPASSWORD, SIGNIN } from "../constant/Constant";
import ForgotPassword from "./ForgotPassword";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { auth } from "../config/Firebase";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../redux/Store";
import { showAlert } from "../redux/AlertSlice";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { Icon } from "react-icons-kit";
import { eye, eyeOff } from "react-icons-kit/feather";
import google from "../asset/img/7123025_logo_google_g_icon.svg";
import { getUserByUid, registerUser } from "../service/Auth";

const SignIn = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const [emailValid, setEmailValid] = useState(true);
    const [authState, setAuthState] = useState(SIGNIN);
    const [inputType, setInputType] = useState("password")
    const [icon, setIcon] = useState(eyeOff);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [cookies, setCookies] = useCookies(["access_token", "refresh_token"]);

    const validateEmail = (input: string) => {
        setEmailValid(EMAILREGEX.test(input));
    }

    const handleSignIn = async () => {
        signInWithEmailAndPassword(auth, email, password)
            .then(async (userCredential) => {
                const user = userCredential.user;
                if (!user.emailVerified) {
                    dispatch(showAlert({ message: "Please verify your email, link has been sent to your email", type: "error" }));
                    signOut(auth);
                }

                if (user.uid) {
                    const accessToken = await user.getIdToken();
                    const refreshToken = user.refreshToken;
                    let expires = new Date()
                    expires.setTime(expires.getTime() + (60 * 60 * 1000))

                    setCookies("access_token", accessToken, { expires })
                    setCookies("refresh_token", refreshToken, { expires })
                    navigate("/");
                }
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.error(error)

                if (errorCode === "auth/invalid-credential") {
                    dispatch(showAlert({ message: 'Email or password is invalid!', type: 'error' }));
                }
            })
    }

    const handleGoogleSignIn = () => {
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider)
            .then(async (userCredential) => {
                const user = userCredential.user;

                if (user.uid && user.email) {
                    const accessToken = await user.getIdToken();
                    const refreshToken = user.refreshToken;
                    let expires = new Date()
                    expires.setTime(expires.getTime() + (60 * 60 * 1000))

                    setCookies("access_token", accessToken, { expires })
                    setCookies("refresh_token", refreshToken, { expires })

                    const existingUser = await getUserByUid(user.uid);

                    if (!existingUser) {
                        registerUser(user.uid, user.displayName, user.email);
                    }

                    navigate("/");
                }
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.error(errorMessage)

                if (errorCode === "auth/invalid-credential") {
                    dispatch(showAlert({ message: 'Email or password is invalid!', type: 'error' }));
                }
            })
    }

    const handleShowPassword = () => {
        setInputType(inputType === 'password' ? 'text' : 'password');
        setIcon(inputType === 'password' ? eye : eyeOff);
    };

    return (
        <div>
            {authState === SIGNIN && (
                <div>
                    <form
                        className="flex flex-col my-4"
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSignIn();
                        }}
                    >
                        <label>Email</label>
                        <input className={`flex-row border border-black px-2 py-1 rounded focus:outline-none focus:ring-1 ${emailValid ? 'focus:border-blue-500 focus:ring-blue-500' : 'border-pink-500 focus:border-pink-500 focus:ring-pink-500'}`} placeholder="Enter your email" value={email} onChange={(e) => { const newEmail = e.target.value; setEmail(newEmail); validateEmail(newEmail); }} onBlur={() => validateEmail(email)} />
                        {!emailValid && (
                            <label className="text-pink-600 text-xs">Please enter a valid email address</label>
                        )}
                        <label className="mt-2">Password</label>
                        <div className="relative w-full">
                            <input
                                type={inputType}
                                className="w-full border border-black pl-2 py-1 pr-8 rounded focus:outline-none focus:ring-1 focus:border-blue-500 focus:ring-blue-500"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <span
                                className="absolute right-3 -bottom-2 top-1/2 transform -translate-y-1/2 cursor-pointer"
                                onClick={handleShowPassword}
                            >
                                <Icon icon={icon} size="15" />
                            </span>
                        </div>
                        <div className="mb-2">
                            <a className="flex-row text-blue-500 cursor-pointer hover:underline" onClick={() => setAuthState(FORGOTPASSWORD)}>Forgot password?</a>
                        </div>
                        <button className="h-10 p-2 bg-blue-500 text-white rounded mt-2 hover:bg-blue-700 active:scale-95 transition-transform duration-200">Continue</button>
                    </form>
                    <div className="flex w-full mb-4">
                        <div className="flex-row h-1/2 w-1/2 my-auto border-t border-black"></div>
                        <p className="px-4">OR</p>
                        <div className="flex-row h-1/2 w-1/2 my-auto border-t border-black"></div>
                    </div>
                    <button
                        className="w-full h-10 border border-black rounded flex items-center justify-center hover:bg-slate-200 active:scale-95 transition-transform duration-200"
                        onClick={handleGoogleSignIn}
                    >
                        <img src={google} alt="Google logo" className="w-[30px] -mb-[2px]" />
                        <span className="leading-none">Continue with Google</span>
                    </button>
                </div>
            )}
            {authState === FORGOTPASSWORD && (
                <div>
                    <ForgotPassword emailInput={email} />
                    <div className="flex justify-center w-full">
                        <button className="text-blue-500 hover:underline" onClick={() => setAuthState(SIGNIN)}>Back</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SignIn;
