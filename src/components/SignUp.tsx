import { useState } from "react";
import { EMAILREGEX, PASSWORDREGEX_ALPHANUMERIC, PASSWORDREGEX_SPECIAL_CHAR, PASSWORDREGEX_UPPER_LOWER } from "../constant/Constant";
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
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

const SignUp = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const [emailReady, setEmailReady] = useState(false);
    const [emailValid, setEmailValid] = useState(true);
    const [nameValid, setNameValid] = useState(true);
    const [passwordValid, setPasswordValid] = useState<boolean[]>([false, false, false, false]);
    const [confirmedPassword, setConfirmedPassword] = useState("");
    const [inputType, setInputType] = useState("password")
    const [icon, setIcon] = useState(eyeOff);
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [cookies, setCookies] = useCookies(["access_token", "refresh_token"]);

    const validateEmail = (input: string) => {
        setEmailValid(EMAILREGEX.test(input));
    }

    const validateName = (input: string) => {
        setNameValid(input.length > 1);
    }

    const validatePassword = (password: string) => {
        const modifiedPasswordState = [
            password.length >= 8 && password.length <= 16,
            PASSWORDREGEX_ALPHANUMERIC.test(password),
            PASSWORDREGEX_UPPER_LOWER.test(password),
            PASSWORDREGEX_SPECIAL_CHAR.test(password)
        ];

        setPasswordValid(modifiedPasswordState);
    };

    const handleEmailSignUp = async (email: string, password: string) => {
        createUserWithEmailAndPassword(auth, email, password)
            .then(async (userCredential) => {
                const user = userCredential.user;

                if (user.email) {
                    const existingUser = await getUserByUid(user.uid);

                    if (!existingUser) {
                        await registerUser(user.uid, name, user.email);
                    }
                }

                sendEmailVerification(user)
                    .then(() => {
                        dispatch(showAlert({ message: "Verification link has been send to: " + email, type: "info", action: () => { navigate("/auth") } }));
                    })
                    .catch((error) => {
                        dispatch(showAlert({ message: "An error occured", type: "error", action: () => { navigate("/auth") } }));
                    });
                signOut(auth);

            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;

                if (errorCode === "auth/email-already-in-use") {
                    dispatch(showAlert({ message: 'Email already in use!', type: 'error', action: () => { navigate("/auth") } }));
                }
            });
    }

    const handleGoogleSignIn = () => {
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider)
            .then(async (userCredential) => {
                const user = userCredential.user;

                if (user.uid && user.email) {
                    const accessToken = await user.getIdToken();
                    const refreshToken = user.refreshToken;
                    let expires = new Date();
                    expires.setTime(expires.getTime() + (60 * 60 * 1000));

                    setCookies("access_token", accessToken, { expires });
                    setCookies("refresh_token", refreshToken, { expires });

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
                    dispatch(showAlert({ message: 'Email or password is invalid!', type: 'error', action: () => { } }));
                }
            })
    }

    const handleShowPassword = () => {
        setInputType(inputType === 'password' ? 'text' : 'password');
        setIcon(inputType === 'password' ? eye : eyeOff);
    };

    return (
        <div>
            {!emailReady && (
                <div>
                    <form
                        className="flex flex-col my-4"
                        onSubmit={(e) => {
                            e.preventDefault();
                            emailValid ? setEmailReady(true) : setEmailReady(false);
                        }}
                    >
                        <label>Email</label>
                        <input className={`flex-row border border-black px-2 py-1 rounded focus:outline-none focus:ring-1 ${emailValid ? 'focus:border-blue-500 focus:ring-blue-500' : 'border-pink-500 focus:border-pink-500 focus:ring-pink-500'}`} placeholder="Enter your email" value={email} onChange={(e) => { const newEmail = e.target.value; setEmail(newEmail); validateEmail(newEmail); }} onBlur={() => validateEmail(email)} />
                        {!emailValid && (
                            <label className="text-pink-600">Please enter a valid email address</label>
                        )}
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
            {emailReady && (
                <div>
                    <form
                        className="flex flex-col my-4"
                        onSubmit={(e) => {
                            if (emailReady && passwordValid.every(Boolean) && nameValid && confirmedPassword === password) {
                                handleEmailSignUp(email, password);
                                e.preventDefault();
                            } else {
                                e.preventDefault();

                            }
                        }}
                    >
                        <label>Full Name</label>
                        <input type="text" className={`flex-row border border-black px-2 py-1 rounded focus:outline-none focus:ring-1 ${nameValid ? 'focus:border-blue-500 focus:ring-blue-500' : 'border-pink-500 focus:border-pink-500 focus:ring-pink-500'}`} placeholder="Enter your name" value={name} onChange={(e) => { setName(e.target.value); validateName(e.target.value); }} onBlur={() => validateName(name)} />
                        {!nameValid && (
                            <label className="text-pink-600 text-xs">Please enter a valid name</label>
                        )}
                        <div className="relative w-full mt-2">
                            <label className="mt-2">Password</label>
                            <input type="text" className={`w-full border border-black pl-2 py-1 pr-8 rounded focus:outline-none focus:ring-1 focus:border-blue-500 focus:ring-blue-500 ${passwordValid.every(Boolean) ? 'focus:border-blue-500 focus:ring-blue-500' : 'border-pink-500 focus:border-pink-500 focus:ring-pink-500'}`} placeholder="Enter your password" value={password} onChange={(e) => {
                                const newPassword = e.target.value;
                                setPassword(newPassword);
                                validatePassword(newPassword);
                            }} onBlur={() => validatePassword(password)} />
                            <span
                                className="absolute right-3 bottom-1 top-1/2 transform -translate-y-1/2 cursor-pointer"
                                onClick={handleShowPassword}
                            >
                                <Icon icon={icon} size="15" />
                            </span>
                            <ul className="text-xs text-pink-600 list-disc list-inside">
                                <li className={`${passwordValid[0] && passwordValid[1] ? 'text-green-500' : 'text-pink-600'}`}>
                                    Password must have 8-16 characters of alphanumeric
                                </li>
                                <li className={`${passwordValid[2] ? 'text-green-500' : 'text-pink-600'}`}>
                                    Password must have at least 1 uppercase and 1 lowercase
                                </li>
                                <li className={`${passwordValid[3] ? 'text-green-500' : 'text-pink-600'}`}>
                                    Password must have at least 1 special character
                                </li>
                            </ul>
                        </div>

                        <label className="mt-2">Confirm Password</label>
                        <input type="text" className={`flex-row border border-black px-2 py-1 rounded focus:outline-none focus:ring-1 ${confirmedPassword === password ? 'focus:border-blue-500 focus:ring-blue-500' : 'border-pink-500 focus:border-pink-500 focus:ring-pink-500'}`} placeholder="Enter your password" onChange={(e) => {
                            const newPassword = e.target.value;
                            setConfirmedPassword(newPassword);
                        }} />
                        {confirmedPassword !== password && (
                            <label className="text-pink-600 text-xs">Password must be same</label>
                        )}
                        <button className="p-2 bg-blue-500 text-white rounded mt-4 hover:bg-blue-700 active:scale-95 transition-transform duration-200">Continue</button>
                        <button className="text-blue-500 hover:underline mt-2" onClick={() => setEmailReady(false)}>Back</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default SignUp;
