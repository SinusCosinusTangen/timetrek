import { useEffect, useState } from "react";
import Page from "../model/Page";
import Task from "../model/Task";
import User from "../model/User";
import { addStage, getPage, getStages, getTasksByPageId, getUserListById, updatePage } from "../service/PageService";
import TaskCard from "./TaskCard";
import { useCookies } from "react-cookie";
import AddTaskForm from "./AddTaskForm";
import { useDispatch } from "react-redux";
import { showTaskForm } from "../redux/TaskSlice";
import { AppDispatch } from "../redux/Store";

interface PageSpaceProps {
    pageId: string;
    user?: User;
    isMinimized?: boolean;
}

const PageSpace: React.FC<PageSpaceProps> = ({ pageId, user, isMinimized }) => {
    const dispatch = useDispatch<AppDispatch>();
    const [cookies, setCookies] = useCookies(["lastAccessedPage"]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isAddingStage, setIsAddingStage] = useState(false);
    const [newStageName, setNewStageName] = useState("");
    const [isEditPageName, setIsEditPageName] = useState(false);
    const [isEditPageDesc, setIsEditPageDesc] = useState(false);

    const [page, setPage] = useState<Page>();
    const [stages, setStages] = useState(page?.Stages || []);
    const [pageName, setPageName] = useState(page?.Name);
    const [pageDescription, setPageDescription] = useState(page?.Description);
    const [pageMembers, setPageMembers] = useState<User[]>([]);

    useEffect(() => {
        (async () => {
            const pageData = await getPage(pageId);
            setPage(pageData);
            setCookies("lastAccessedPage", pageData?.Id);
        })();
    }, [pageId])

    useEffect(() => {
        if (page?.Id) {
            handleGetTasks();
            handleGetStages();
            handleGetMembers();
            setPageName(page.Name);
            setPageDescription(page.Description);
        }
    }, [page]);

    const handleGetMembers = async () => {
        try {
            if (page?.Id) {
                const userList = await getUserListById(page.Members);
                setPageMembers(userList);
            }
        } catch (error) {
            console.error("Failed to fetch members:", error);
        }
    }

    const handleGetTasks = async () => {
        try {
            if (page?.Id) {
                const taskList = await getTasksByPageId(page.Id);
                setTasks(taskList);
            }
        } catch (error) {
            console.error("Failed to fetch tasks:", error);
        }
    };

    const handleGetStages = async () => {
        try {
            if (page?.Id) {
                const stageList = await getStages(page.Id);
                setStages(stageList);
            }
        } catch (error) {
            console.error("Failed to fetch stages:", error);
        }
    };

    if (!page || !user) {
        return <div>Select a page to view tasks</div>;
    }

    const handleAddTask = async () => {
        const maker = user;
        maker.LastLoggedIn = maker.LastLoggedIn.toString();

        const members = pageMembers.map((member) => ({
            ...member,
            LastLoggedIn: member.LastLoggedIn.toString()
        }));

        dispatch(showTaskForm({ pageId: pageId, type: "ADD", maker: maker, members: members }))
        await handleGetTasks();
    };

    const handleUpdatePage = async (newPageName?: string, newPageDescription?: string) => {
        if (page.Id) {
            await updatePage(page.Id, newPageName, newPageDescription);
        }
    }

    const handleAddStage = async () => {
        if (page?.Id && newStageName.trim()) {
            await addStage(page.Id, newStageName);
            setNewStageName("");
            handleGetStages(); // Refresh stages after adding a new one
        }
    };

    return (
        <div className="h-full flex flex-col pt-4">
            <div className={`fixed top-12 bg-amber-200 shadow-md z-10 ${isMinimized ? 'ml-1 w-[calc(99%-12px)]' : 'w-[calc(80%)]'}`}>
                <div className="flex justify-between items-center p-4">
                    <div className="flex flex-col flex-shrink">
                        {!isEditPageName ? (
                            <h1 className="text-xl font-semibold cursor-pointer truncate" onClick={() => setIsEditPageName(true)}>{pageName}</h1>
                        ) : (
                            <input
                                type="text"
                                value={pageName}
                                onChange={(e) => setPageName(e.target.value)}
                                placeholder="Enter project name"
                                className="w-full border-b-2 border-slate-400 px-2 py-1 focus:outline-none"
                                onBlur={() => setIsEditPageName(false)}
                                onKeyDown={(e) => {
                                    if (e.key == 'Enter') {
                                        setIsEditPageName(false);
                                        setPageName(pageName)
                                        handleUpdatePage(pageName, undefined);
                                    }
                                }}
                                autoFocus
                            />
                        )}
                        {!isEditPageDesc ? (
                            <h1 className="text-sm text-gray-700 cursor-pointer truncate" onClick={() => setIsEditPageDesc(true)}>{pageDescription}</h1>
                        ) : (
                            <input
                                type="text"
                                value={pageDescription}
                                onChange={(e) => setPageDescription(e.target.value)}
                                placeholder="Enter project name"
                                className="w-full border-b-2 border-slate-400 px-2 focus:outline-none"
                                onBlur={() => setIsEditPageDesc(false)}
                                onKeyDown={(e) => {
                                    if (e.key == 'Enter') {
                                        setIsEditPageDesc(false);
                                        setPageDescription(pageDescription)
                                        handleUpdatePage(undefined, pageDescription);
                                    }
                                }}
                                autoFocus
                            />
                        )}
                    </div>
                    <div className="flex-shrink-0 ml-4">
                        <button
                            className="min-w-[8rem] px-8 py-2 bg-slate-200 rounded-lg hover:bg-slate-300 active:scale-95 transition"
                            onClick={handleAddTask}
                        >
                            {'New Task'}
                        </button>
                    </div>
                </div>
            </div>
            <div className="flex-1 bg-sky-200 mt-16 p-4 overflow-auto">
                <AddTaskForm />
                <div className="grid grid-flow-col gap-4">
                    {stages && stages.map((stage) => (
                        <div key={stage.Step} className="flex flex-col">
                            <div className="grid grid-flow-col justify-between">
                                <p className="font-medium mb-2">{stage.Name}</p>
                                <p>Opt</p>
                            </div>
                            <div className="min-h-[35rem] w-[20rem] px-2 py-2 bg-slate-200 rounded-lg">
                                {tasks
                                    .filter(task => task.Stage === stage.Step)
                                    .map((task) => (
                                        <TaskCard task={task} key={task.Id} />
                                    ))}
                            </div>
                        </div>
                    ))}
                    {!isAddingStage ? (
                        <button
                            className="w-[20rem] h-fit border-2 border-slate-400 rounded-lg px-8 py-2 hover:bg-gradient-to-r hover:from-slate-400/50 hover:to-slate-600/50 active:scale-95 transition-transform duration-100"
                            onClick={() => setIsAddingStage(true)}
                        >
                            + Add Stage
                        </button>
                    ) : (
                        <input
                            type="text"
                            value={newStageName}
                            onChange={(e) => setNewStageName(e.target.value)}
                            placeholder="Enter stage name"
                            className="w-[20rem] h-fit border-2 border-slate-400 rounded-lg px-4 py-2"
                            onBlur={() => setIsAddingStage(false)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleAddStage();
                                    setIsAddingStage(false);
                                }
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default PageSpace;
