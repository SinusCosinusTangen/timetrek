import User from "../model/User";

interface ProjectSpaceProps {
    projectId: string;
    user: User;
}

const ProjectSpace: React.FC<ProjectSpaceProps> = ({ projectId, user }) => {
    return (
        <div className="h-screen mb-6">
            {user.Name !== "OWNER" && (
                <div className="grid grid-flow-col gap-4">
                    <div className="flex flex-col">
                        Project
                        <button className="min-h-screen min-w-[15rem] max-w-[25rem] px-8 py-2 bg-slate-200">
                            + Add Project/Page
                        </button>
                    </div>
                    <div className="flex flex-col">
                        Project
                        <div className="min-h-screen min-w-[15rem] max-w-[25rem] px-8 py-2 bg-slate-200">
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ProjectSpace;