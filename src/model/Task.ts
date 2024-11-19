interface Task {
    Id?: string;
    Page: string;
    Assignee: string;
    Name: string;
    Stage: number;
    StartDateTime: Date;
    TargetDateTime: Date;
    EndDateTime: Date;
    TimeCounter: number;
    NotifiedMembers: string[];
}

export default Task;