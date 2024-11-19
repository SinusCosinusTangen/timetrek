interface User {
    Id: string;
    DocId?: string;
    Name: string;
    Email: string;
    LastLoggedIn: Date | string;
    PhotoUrl?: string;
}

export default User;