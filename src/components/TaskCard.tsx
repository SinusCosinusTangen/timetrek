import Task from "../model/Task";
import User from "../model/User";
import { getUserByUid } from "../service/Auth";
import ProgressBar from "./ProgressBar";
import { useState, useEffect } from "react";

interface TaskCardProps {
    task: Task;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
    const [assignee, setAssignee] = useState<User | null>();

    useEffect(() => {
        const fetchAssignee = async () => {
            try {
                const user = await getUserByUid(task.Assignee);
                if (user) {
                    setAssignee(user);
                }
            } catch (error) {
                console.error("Error fetching user:", error);
            }
        };

        fetchAssignee();
    }, [task.Assignee]);

    return (
        <div key={task.Id} className="w-full border-2 bg-white rounded-md p-2">
            <h1 className="text-lg font-semibold">{task.Name}</h1>
            <div className="flex bg-gray-200 w-fit p-1 px-2 rounded-lg mt-2">
                <img src={assignee?.PhotoUrl} className="rounded-full border border-black h-5 w-5 my-auto" />
                <span className="ml-1">{assignee?.Name}</span>
            </div>
            <ProgressBar
                className="w-full mt-2"
                startDateTime={task.StartDateTime.getTime()}
                targetDateTime={task.TargetDateTime.getTime()}
                endDateTime={task.EndDateTime.getTime()}
            />
        </div>
    );
}

export default TaskCard;