import { addDoc, collection, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import User from "../model/User"
import { db } from "../config/Firebase";
import { DBProps } from "../constant/Constant";
import Page from "../model/Page";
import Stage from "../model/Stage";
import Task from "../model/Task";

const addPage = async (uid: string, name: string, user: User) => {
    try {
        const defaultStages: Stage[] = [{ Step: 1, Name: "Ready to Start", Task: [] }, { Step: 2, Name: "On Progress", Task: [] }, { Step: 3, Name: "Done", Task: [] }]
        const newMember: string[] = [user.Id];
        const newPage: Page = {
            Owner: uid,
            Name: name,
            Description: "<<No Description>>",
            TotalStage: defaultStages.length,
            Stages: defaultStages,
            Members: newMember
        }

        const result = await addDoc(collection(db, DBProps.Pages), newPage);

        if (result.id) {
            return true;
        }

        return false;
    } catch (error) {
        throw error;
    }
}

const addStage = async (pageId: string, name: string) => {
    try {
        const pageRef = doc(db, DBProps.Pages, pageId);
        const pageSnap = await getDoc(pageRef);
        const pageData = pageSnap.data();

        if (pageSnap && pageData) {
            const newStage: Stage = {
                Name: name,
                Step: pageData.TotalStage + 1,
                Task: []
            }
            const stages: Stage[] = pageData.Stages;
            stages.push(newStage);
            await updateDoc(pageRef, {
                TotalStage: pageData.TotalStage + 1,
                Stages: stages
            })
            return true;
        }
        return false;
    } catch (error) {
        throw error;
    }
}

const getAllPages = async (uid: string) => {
    try {
        const pageRef = collection(db, DBProps.Pages);
        const q = query(pageRef, where("Members", "array-contains", uid));
        const querySnapshot = await getDocs(q);

        if (querySnapshot) {
            const pageList: Page[] = querySnapshot.docs.map((doc) => {
                const data = doc.data();

                return {
                    Id: doc.id,
                    Name: data.Name,
                    Description: data.Description,
                    Owner: data.Owner,
                    TotalStage: data.TotalStage,
                    Stages: data.Stages,
                    Members: data.Members
                };
            });
            return pageList;
        }

        return [];
    } catch (error) {
        throw error;
    }
}

const getPage = async (pageId: string) => {
    try {
        const pageRef = doc(db, DBProps.Pages, pageId);
        const pageSnap = await getDoc(pageRef);
        const data = pageSnap.data();

        if (data) {
            const page: Page = {
                Id: pageSnap.id,
                Name: data.Name,
                Description: data.Description,
                Owner: data.Owner,
                TotalStage: data.TotalStage,
                Stages: data.Stages,
                Members: data.Members
            };
            return page;
        }
    } catch (error) {

    }
}

const updatePage = async (pageId: string, pageName?: string, pageDescription?: string) => {
    try {
        const pageRef = doc(db, DBProps.Pages, pageId);
        const pageSnap = await getDoc(pageRef);
        const pageData = pageSnap.data();

        if (pageData) {
            await updateDoc(pageRef, {
                Name: pageName ? pageName : pageData.Name,
                Description: pageDescription ? pageDescription : pageData.Description
            })
        }

        return pageData;
    } catch (error) {

    }
}

const getTasksByPageId = async (pageId: string) => {
    try {
        const taskRef = collection(db, DBProps.Task);
        const q = query(taskRef, where("Page", "==", pageId))
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
                    StartDateTime: data.StartDateTime.toDate(),
                    TargetDateTime: data.TargetDateTime.toDate(),
                    EndDateTime: data.EndDateTime.toDate(),
                    TimeCounter: data.TimeCounter,
                    NotifiedMembers: data.NotifiedMembers
                };
            });
            return taskList;
        }

        return [];
    } catch (error) {
        throw error;
    }
}

const getStages = async (pageId: string) => {
    const page = await getPage(pageId);

    if (page) {
        return page.Stages;
    }

    return []
}

const getUserListById = async (userIds: string[]) => {
    try {
        const taskRef = collection(db, DBProps.User);
        const q = query(taskRef, where("Id", "in", userIds))
        const querySnapshot = await getDocs(q);

        if (querySnapshot) {
            const userList: User[] = querySnapshot.docs.map((doc) => {
                const data = doc.data();

                return {
                    Id: data.Id,
                    Name: data.Name,
                    Email: data.Email,
                    LastLoggedIn: data.LastLoggedIn,
                };
            });
            return userList;
        }

        return [];
    } catch (error) {
        throw error;
    }
}

export { addPage, getAllPages, getPage, getTasksByPageId, addStage, getStages, updatePage, getUserListById };