import { useEffect, useRef, useState } from "react";
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
import { threeVertical } from "react-icons-kit/entypo/threeVertical";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import Icon from "react-icons-kit";
import { updateTask } from "../service/TaskService";

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
    const [menuVisible, setMenuVisible] = useState<{ [key: string]: boolean }>({});
    const menuRef = useRef<HTMLDivElement>(null);

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
    }, [pageId]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuVisible({});
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const handleGetMembers = async () => {
        try {
            if (page?.Id) {
                const userList = await getUserListById(page.Members);
                setPageMembers(userList);
            }
        } catch (error) {
            console.error("Failed to fetch members:", error);
        }
    };

    const handleGetTasks = async () => {
        try {
            if (page?.Id) {
                const taskList = await getTasksByPageId(page.Id);
                const sortedTasks = taskList.sort(
                    (task1, task2) => new Date(task1.UpdatedAt).getTime() - new Date(task2.UpdatedAt).getTime()
                );
                setTasks(sortedTasks);
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

    useEffect(() => {
        if (page?.Id) {
            handleGetTasks();
            handleGetStages();
            handleGetMembers();
            setPageName(page.Name);
            setPageDescription(page.Description);
        }
    }, [page]);

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

        dispatch(showTaskForm({ pageId: pageId, type: "ADD", maker: maker, members: members }));
        await handleGetTasks();
    };

    const handleUpdatePage = async (newPageName?: string, newPageDescription?: string) => {
        if (page.Id) {
            await updatePage(page.Id, newPageName, newPageDescription);
        }
    };

    const handleAddStage = async () => {
        if (page?.Id && newStageName.trim()) {
            await addStage(page.Id, newStageName);
            setNewStageName("");
            handleGetStages();
        }
    };

    const onDragEnd = async (result: any) => {
        const { source, destination, draggableId } = result;

        if (!destination) return;

        const taskId = draggableId;
        const newStage = parseInt(destination.droppableId);
        const prevStage = parseInt(source.droppableId);

        if (newStage === prevStage) return;

        setTasks((prevTasks) => {
            const updatedTasks = prevTasks.map((task) =>
                task.Id === taskId ? { ...task, Stage: newStage } : task
            );

            return updatedTasks.sort((task1, task2) =>
                new Date(task1.UpdatedAt).getTime() - new Date(task2.UpdatedAt).getTime()
            );
        });

        try {
            await updateTaskStage(taskId, newStage);
            await handleGetTasks();
        } catch (error) {
            console.error("Failed to update task stage:", error);
            setTasks((prevTasks) => {
                const revertedTasks = prevTasks.map((task) =>
                    task.Id === taskId ? { ...task, Stage: prevStage } : task
                );

                return revertedTasks.sort(
                    (task1, task2) =>
                        new Date(task2.UpdatedAt).getTime() - new Date(task1.UpdatedAt).getTime()
                );
            });
        }
    };

    const updateTaskStage = async (taskId: string, newStage: number) => {
        try {
            await updateTask(taskId, newStage);
        } catch (error) {
            console.error("Failed to update task stage:", error);
        }
    };

    const handleMenuClick = (stageStep: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setMenuVisible(prevState => ({
            ...prevState,
            [stageStep]: !prevState[stageStep],
        }));
    };

    const handleDeleteStage = (stageStep: number) => {

    }

    return (
        <div className="h-full flex flex-col pt-4">
            {/* Page header */}
            <div className={`fixed top-12 bg-gradient-to-r from-amber-200 via-amber-100 to-amber-50 shadow-lg z-10 ${isMinimized ? 'ml-1 w-[calc(99%-12px)]' : 'w-[calc(80%)]'}`}>
                <div className="flex justify-between items-center p-4">
                    <div className="flex flex-col flex-shrink">
                        {/* Editable Page Name */}
                        {!isEditPageName ? (
                            <h1 className="text-2xl font-semibold cursor-pointer text-gray-800 hover:text-gray-600 transition-all truncate" onClick={() => setIsEditPageName(true)}>
                                {pageName}
                            </h1>
                        ) : (
                            <input
                                type="text"
                                value={pageName}
                                onChange={(e) => setPageName(e.target.value)}
                                placeholder="Enter project name"
                                className="w-full border-b-2 border-slate-400 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-amber-300 transition-all rounded-md"
                                onBlur={() => setIsEditPageName(false)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        setIsEditPageName(false);
                                        setPageName(pageName);
                                        handleUpdatePage(pageName, undefined);
                                    }
                                }}
                                autoFocus
                            />
                        )}

                        {/* Editable Page Description */}
                        {!isEditPageDesc ? (
                            <h2 className="text-sm text-gray-600 cursor-pointer hover:text-gray-500 transition-all truncate" onClick={() => setIsEditPageDesc(true)}>
                                {pageDescription}
                            </h2>
                        ) : (
                            <input
                                type="text"
                                value={pageDescription}
                                onChange={(e) => setPageDescription(e.target.value)}
                                placeholder="Enter project description"
                                className="w-full border-b-2 border-slate-400 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-amber-300 transition-all rounded-md"
                                onBlur={() => setIsEditPageDesc(false)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        setIsEditPageDesc(false);
                                        setPageDescription(pageDescription);
                                        handleUpdatePage(undefined, pageDescription);
                                    }
                                }}
                                autoFocus
                            />
                        )}
                    </div>

                    {/* Add New Task Button */}
                    <div className="flex-shrink-0 ml-4">
                        <button
                            className="min-w-[8rem] px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-400 active:scale-95 transition-all shadow-md"
                            onClick={handleAddTask}
                        >
                            New Task
                        </button>
                    </div>
                </div>
            </div>

            {/* Page body */}
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex-1 mt-16 p-6 overflow-auto bg-gray-50">
                    <AddTaskForm />
                    <div className="grid grid-flow-col gap-4">
                        {/* Stage column */}
                        {stages.map((stage) => (
                            <Droppable key={stage.Step} droppableId={`${stage.Step}`}>
                                {(provided) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className="flex flex-col mb-6 min-h-[35rem] w-[20rem] p-4 bg-white rounded-lg shadow-md gap-4 hover:shadow-xl transition-all"
                                    >
                                        {/* Stage Header */}
                                        <div className="flex justify-between items-center mb-2 relative"> {/* Add relative positioning to parent */}
                                            <p className="font-medium text-lg text-gray-800">{stage.Name}</p>
                                            <button
                                                className="text-gray-600 hover:text-gray-500"
                                                aria-label="Options"
                                                onClick={(e) => handleMenuClick(stage.Step, e)}
                                            >
                                                <Icon icon={threeVertical} />
                                            </button>
                                            {/* Dropdown Menu */}
                                            {menuVisible[stage.Step] && (
                                                <div
                                                    ref={menuRef}
                                                    className="absolute mt-2 w-32 bg-white shadow-lg rounded-lg"
                                                    style={{
                                                        top: '100%',
                                                        right: '0', // Aligns the dropdown menu directly below the button
                                                        zIndex: 10 // Ensures the dropdown is above other elements
                                                    }}
                                                >
                                                    <button className="block px-4 py-2 w-full text-gray-800 rounded-t-lg hover:bg-gray-200">
                                                        Edit
                                                    </button>
                                                    <button className="block px-4 py-2 w-full text-red-600 rounded-b-lg hover:bg-gray-200" onClick={() => handleDeleteStage(stage.Step)}>
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>


                                        {/* Task Cards */}
                                        {tasks
                                            .filter(task => task.Stage === stage.Step)
                                            .map((task, index) => (
                                                <Draggable key={task.Id} draggableId={task.Id ? task.Id : ""} index={index}>
                                                    {(provided) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className="transition-all"
                                                        >
                                                            <TaskCard task={task} />
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        ))}

                        {/* Add New Stage Button */}
                        {!isAddingStage ? (
                            <button
                                className="w-[20rem] h-fit border-2 border-amber-400 rounded-lg px-6 py-2 hover:bg-gradient-to-r hover:from-amber-300 hover:to-amber-500 text-amber-700 active:scale-95 transition-all"
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
                                className="w-[20rem] h-fit border-2 border-amber-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-300 transition-all"
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
            </DragDropContext>
        </div>
    );
};

export default PageSpace;
