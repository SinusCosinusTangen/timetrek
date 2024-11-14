import { addDoc, collection, getDocs, query, where } from "firebase/firestore"
import { db } from "../config/Firebase"
import User from "../model/User"
import { DBProps } from "../constant/Constant"

const registerUser = async (uid: string, name: string | null, email: string) => {
    try {
        const newUser: User = {
            Id: uid,
            Name: name ?? "User",
            Email: email,
            LastLoggedIn: new Date()
        };

        const result = await addDoc(collection(db, DBProps.User), newUser);

        if (result.id) {
            return true;
        }

        return false;
    } catch (error) {
        console.error(error);
    }
}

const getUserByUid = async (uid: string): Promise<User | null | undefined> => {
    try {
        const userRef = collection(db, DBProps.User);
        const q = query(userRef, where("Id", "==", uid));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return null;
        }

        const userData = querySnapshot.docs[0].data();
        const user: User = {
            Id: userData.Id,
            Name: userData.Name,
            Email: userData.Email,
            LastLoggedIn: userData.LastLoggedIn
        }

        return user;
    } catch (error) {

    }
}

export { registerUser, getUserByUid }