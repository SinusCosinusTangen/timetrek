import { addDoc, collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../config/Firebase";
import { DBProps } from "../constant/Constant";
import Stage from "../model/Stage";
import Task from "../model/Task";

const addNewTask = async (task: Task) => {
    try {
        const pageRef = doc(db, DBProps.Pages, task.Page);
        const pageSnap = await getDoc(pageRef);
        const pageData = pageSnap.data();

        if (pageSnap && pageData) {
            await addDoc(collection(db, DBProps.Task), task)
                .then(async (docRef) => {
                    const stages: Stage[] = pageData.Stages;
                    stages
                        .filter(stage => stage.Step === task.Stage)
                        .map((stage) => {
                            stage.Task.push(docRef.id);
                        })
                    await updateDoc(pageRef, {
                        Stages: stages
                    })
                    return true;
                })
                .catch((error) => false);

            return false;
        }
    } catch (error) {
        throw error;
    }
}

export { addNewTask }