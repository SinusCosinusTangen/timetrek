interface Task {
    Id?: string;
    Page: string;
    Assignee: string;
    Name: string;
    Stage: number;
    StartDateTime: Date;
    TargetDateTime: Date;
    EndDateTime: Date;
    EndedTime: Date | null;
    NotifiedMembers: string[];
    CreatedAt: Date;
    UpdatedAt: Date;
}

export default Task;