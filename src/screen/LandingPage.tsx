import { useEffect, useState } from "react";
import SignIn from "../components/SignIn";
import SignUp from "../components/SignUp";
import { auth } from "../config/Firebase";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../redux/Store";
import { showAlert } from "../redux/AlertSlice";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getUserByUid } from "../service/Auth";
import User from "../model/User";
import ProjectSpace from "../components/ProjectSpace";
import { addProject } from "../service/ProjectService";

const LandingPage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const [user, setUser] = useState<User>({ Id: "", Name: "", Email: "", LastLoggedIn: new Date() });
    const [profilePic, setProfilePic] = useState("");
    const projectList: string[] = [];
    const [isMinimized, setIsMinimized] = useState(false);
    const [isAddingProject, setIsAddingProject] = useState(false);
    const [projectName, setProjectName] = useState("");

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
            if (currentUser?.uid) {
                const user = await getUserByUid(currentUser?.uid);

                if (user) {
                    setUser(user);
                }

                if (currentUser.photoURL) {
                    setProfilePic(currentUser.photoURL);
                }
            }
            if (!currentUser) {
                dispatch(showAlert({ message: "You need to login to access this page", type: "error", action: () => { navigate("/auth"); } }))
            }
        });



        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        try {
            await auth.signOut();
            dispatch(showAlert({ message: "Success logout", type: "info", action: () => { navigate("/auth"); } }))
        } catch (error) {
            console.error("Sign out error:", error);
        }
    };

    for (let i = 0; i < 30; i++) {
        projectList.push("Project " + i);
    }

    const handleAddProject = async () => {
        try {
            await addProject(user.Id, projectName, user);
        } catch (error) {

        }
    }

    return (
        <div className="min-h-screen">
            <Navbar name={user.Name} email={user.Email} profilePic={profilePic} />
            {user && (
                <div className="flex h-screen pt-12">
                    {!isMinimized && (
                        <div id="project-pane" className="flex flex-col bg-zinc-100 items-center w-1/5 h-full border-r-2 border-slate-300">
                            <button
                                className="flex w-full p-2 font-semibold text-lg"
                                onClick={() => setIsMinimized(prev => !prev)}
                            >
                                &times;
                            </button>
                            <div className="flex flex-col w-full px-4 py-4 mb-4 gap-4 overflow-y-auto">
                                {!isAddingProject ? (
                                    <button
                                        className="w-full border-2 border-slate-400 rounded-lg px-8 py-2 hover:bg-gradient-to-r hover:from-slate-400/50 hover:to-slate-600/50 active:scale-95 transition-transform duration-100"
                                        onClick={() => setIsAddingProject(true)}
                                    >
                                        + Add Project/Page
                                    </button>
                                ) : (
                                    <input
                                        type="text"
                                        value={projectName}
                                        onChange={(e) => setProjectName(e.target.value)}
                                        placeholder="Enter project name"
                                        className="w-full border-2 border-slate-400 rounded-lg px-4 py-2"
                                        onBlur={() => setIsAddingProject(false)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                setIsAddingProject(false);
                                                handleAddProject();
                                                setProjectName("");
                                            }
                                        }}
                                    />
                                )}
                                {projectList.map((projectName, index) => (
                                    <button key={index} className="w-full border-2 border-slate-400 rounded-lg px-8 py-2">
                                        {projectName}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {isMinimized && (
                        <div id="project-pane" className="fixed flex flex-col bg-zinc-100 items-center w-fit h-full cursor-pointer p-2 font-bold border-r-2 border-slate-500" onClick={() => setIsMinimized(prev => !prev)}>
                            {'+'}
                        </div>
                    )}
                    <div id="task-pane" className={`flex flex-col p-4 mr-4 ${isMinimized ? 'w-full ml-6' : 'w-4/5'} overflow-y-auto`}>
                        <div className="items-center gap-8">
                            <ProjectSpace projectId="project1" user={user} />
                        </div>
                    </div>
                </div>
            )}
        </div>

    );
};

export default LandingPage;
