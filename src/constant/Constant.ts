export const SIGNIN = "SIGN IN";
export const SIGNUP = "SIGN UP";
export const FORGOTPASSWORD = "FORGOT PASSWORD";
export const EMAILREGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const PASSWORDREGEX_ALPHANUMERIC = /^(?=.*[A-Za-z])(?=.*\d).+$/;
export const PASSWORDREGEX_UPPER_LOWER = /(?=.*[a-z])(?=.*[A-Z])/;
export const PASSWORDREGEX_SPECIAL_CHAR = /(?=.*[-!@#$%^&*(),.?":{}|<>])/;

export enum DBProps {
    Pages = "pages",
    User = "users",
    Task = "tasks",
    Stages = "stages",
}