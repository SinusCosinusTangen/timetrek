import Stage from "./Stage";

interface Page {
    Id?: string;
    Owner: string;
    Name: string;
    Description: string;
    TotalStage: number;
    Stages: Stage[];
    Members: string[];
}

export default Page;