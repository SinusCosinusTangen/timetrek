import User from "./User";

interface Project {
    Owner: string;
    Name: string;
    Description: string;
    Members: User[];
}

export default Project;