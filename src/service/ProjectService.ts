import { addDoc, collection } from "firebase/firestore";
import Project from "../model/Project"
import User from "../model/User"
import { db } from "../config/Firebase";
import { DBProps } from "../constant/Constant";

const addProject = async (uid: string, name: string, user: User) => {
    try {
        const newMember: User[] = [user];
        const newProject: Project = {
            Owner: uid,
            Name: name,
            Description: "",
            Members: newMember
        }

        const result = await addDoc(collection(db, DBProps.Project), newProject);

        if (result.id) {
            return true;
        }

        return false;
    } catch (error) {

    }
}

export { addProject }