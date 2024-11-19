import Task from "../model/Task";
import { useState, useEffect } from "react";
import ProgressBar from "./ProgressBar";

interface TaskCardProps {
    task: Task;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => {
            clearInterval(intervalId);
        };
    }, []);

    useEffect(() => {
        const totalDuration = task.TargetDateTime.getTime() - task.StartDateTime.getTime();
        const elapsedTime = currentTime.getTime() - task.StartDateTime.getTime();
        const progressValue = Math.min(Math.max(elapsedTime, 0), totalDuration);

        setProgress(progressValue);

    }, [currentTime, task]);

    const totalDurationInHours = (new Date(task.TargetDateTime).getTime() - new Date(task.StartDateTime).getTime()) / (1000 * 60 * 60); // Total duration in hours

    return (
        <div key={task.Id} className="w-full border-2 bg-white rounded-md p-2">
            {task.Name}
            <ProgressBar className="my-2" progress={((currentTime.getTime() - task.StartDateTime.getTime()) / (task.TargetDateTime.getTime() - task.StartDateTime.getTime())) * 100} />
            <ProgressBar className="my-2" progress={((currentTime.getTime() - task.StartDateTime.getTime()) / (task.EndDateTime.getTime() - task.StartDateTime.getTime())) * 100} />
            <div>
                Progress: {((progress / (task.TargetDateTime.getTime() - task.StartDateTime.getTime())) * 100).toFixed(2)}%
            </div>
            <div>
                Duration: {totalDurationInHours.toFixed(2)} hours
            </div>
        </div>
    );
}

export default TaskCard;