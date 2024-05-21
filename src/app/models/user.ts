export type User = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
}

export type UserLoginResponse = {
    id: number;
    email: string;
    token: string;
}

export type SessionRefreshResponse = UserLoginResponse;