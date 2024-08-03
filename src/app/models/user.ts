export type User = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
}

export type UserLoginResponse = {
    id: string;
    email: string;
    token: string;
}

export type SessionRefreshResponse = UserLoginResponse;