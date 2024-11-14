import Project from "./Project";
import User from "./User";

interface Task {
    Id: string;
    Project: string;
    Asignee: string;
    Name: string;
    StartDateTime: Date;
    TargetDateTime: Date;
    EndDateTime: Date;
    TimeCounter: number;
    NotifiedMembers: User[];
}

export default Task;