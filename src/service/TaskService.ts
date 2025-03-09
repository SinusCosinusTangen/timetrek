import { addDoc, collection, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { db } from "../config/Firebase";
import { DBProps } from "../constant/Constant";
import Task from "../model/Task";

const addNewTask = async (task: Task) => {
    try {
        const pageRef = doc(db, DBProps.Pages, task.Page);
        const pageSnap = await getDoc(pageRef);
        const pageData = pageSnap.data();

        if (pageSnap && pageData) {
            await addDoc(collection(db, DBProps.Task), task)
                .then(async (docRef) => {
                    return true;
                })
                .catch((error) => false);

            return false;
        }
    } catch (error) {
        throw error;
    }
}

const updateTask = async (taskId: string, newStage: number) => {
    try {
        const taskRef = doc(db, DBProps.Task, taskId);
        const taskSnap = await getDoc(taskRef);
        const taskData = taskSnap.data();
        if (taskData) {
            await updateDoc(taskRef, {
                Stage: newStage,
                UpdatedAt: new Date()
            })

            return taskData;
        }
    } catch (error) {
        throw error;
    }
}

const getTasksByPageIdAndStage = async (pageId: string, stage: number) => {
    try {
        const taskRef = collection(db, DBProps.Task);
        const q = query(taskRef, where("Page", "==", pageId), where("Stage", "==", stage))
        const querySnapshot = await getDocs(q);

        if (querySnapshot) {
            const taskList: Task[] = querySnapshot.docs.map((doc) => {
                const data = doc.data();

                return {
                    Id: doc.id,
                    Name: data.Name,
                    Page: data.Page,
                    Stage: data.Stage,
                    Assignee: data.Assignee,
                    Stages: data.Stages,
                    Order: data.Order,
                    StartDateTime: data.StartDateTime.toDate(),
                    TargetDateTime: data.TargetDateTime.toDate(),
                    EndDateTime: data.EndDateTime.toDate(),
                    EndedTime: data.EndedTime ? data.EndedTime.toDate() : null,
                    NotifiedMembers: data.NotifiedMembers,
                    Position: data.Position,
                    CreatedAt: data.CreatedAt.toDate(),
                    UpdatedAt: data.UpdatedAt.toDate()
                };
            });
            return taskList;
        }

        return [];
    } catch (error) {
        throw error;
    }
}

export { addNewTask, updateTask, getTasksByPageIdAndStage }