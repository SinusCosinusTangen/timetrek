import { useEffect, useState } from "react";
import { auth } from "../config/Firebase";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../redux/Store";
import { showAlert } from "../redux/AlertSlice";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getUserByUid } from "../service/Auth";
import User from "../model/User";
import PageSpace from "../components/PageSpace";
import { addPage, getAllPages } from "../service/PageService";
import Project from "../model/Page";
import Page from "../model/Page";
import { useCookies } from "react-cookie";

const LandingPage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const [cookies, setCookies] = useCookies(["lastAccessedPage"]);
    const [user, setUser] = useState<User | null>(null);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isAddingPage, setIsAddingPage] = useState(false);
    const [page, setPage] = useState<Page>();
    const [pageName, setPageName] = useState("");
    const [pageList, setPageList] = useState<Page[]>();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
            if (currentUser?.uid) {
                const user = await getUserByUid(currentUser?.uid);

                if (user) {
                    if (currentUser.photoURL) {
                        user.PhotoUrl = currentUser.photoURL;
                    }
                    setUser(user);
                }
            }
            if (!currentUser) {
                navigate("/auth");
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        handleGetAllProjects();
    }, [user])

    const handleAddProject = async () => {
        try {
            if (user) {
                await addPage(user.Id, pageName, user);
                await handleGetAllProjects();
            }
        } catch (error) {

        }
    }

    const handleGetAllProjects = async () => {
        try {
            if (user) {
                const projects: Project[] = await getAllPages(user.Id);
                setPageList(projects);
            }
        } catch (error) {
            console.error(error);
            dispatch(showAlert({ message: "Error while fetching projects", type: "error" }));
        }
    }

    return (
        <div className="min-h-screen">
            {user && user.PhotoUrl && (<Navbar name={user.Name} email={user.Email} profilePic={user.PhotoUrl} />)}
            {user && (
                <div className="flex h-screen pt-12">
                    {!isMinimized && (
                        <div id="project-pane" className="flex flex-col bg-zinc-100 items-center w-1/5 h-full border-r-2 border-slate-400">
                            <button
                                className="flex w-full p-2 font-semibold text-lg"
                                onClick={() => setIsMinimized(prev => !prev)}
                            >
                                &times;
                            </button>
                            <div className="flex flex-col w-full px-4 py-4 mb-4 gap-4 overflow-y-auto">
                                {!isAddingPage ? (
                                    <button
                                        className="w-full border-2 border-slate-400 rounded-lg px-8 py-2 hover:bg-gradient-to-r hover:from-slate-400/50 hover:to-slate-600/50 active:scale-95 transition-transform duration-100"
                                        onClick={() => setIsAddingPage(true)}
                                    >
                                        + Add Page
                                    </button>
                                ) : (
                                    <input
                                        type="text"
                                        value={pageName}
                                        onChange={(e) => setPageName(e.target.value)}
                                        placeholder="Enter project name"
                                        className="w-full border-2 border-slate-400 rounded-lg px-4 py-2"
                                        onBlur={() => setIsAddingPage(false)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleAddProject();
                                                setIsAddingPage(false);
                                                setPageName("");
                                            }
                                        }}
                                    />
                                )}
                                {pageList && pageList.map((page, index) => (
                                    <button key={index} className="w-full border-2 border-slate-400 rounded-lg px-8 py-2" onClick={() => page.Id ? setPage(page) : ""}>
                                        {page.Name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {isMinimized && (
                        <div id="project-pane" className="fixed flex flex-col z-20 bg-zinc-100 items-center w-fit h-full cursor-pointer p-2 font-bold border-r-2 border-slate-400" onClick={() => setIsMinimized(prev => !prev)}>
                            {'+'}
                        </div>
                    )}
                    <div id="task-pane" className={`flex flex-col ${isMinimized ? 'w-full ml-6' : 'w-4/5'} overflow-auto`}>
                        <PageSpace pageId={page?.Id ? page?.Id : cookies.lastAccessedPage} user={user} isMinimized={isMinimized} />
                    </div>
                </div>
            )}
        </div>

    );
};

export default LandingPage;
