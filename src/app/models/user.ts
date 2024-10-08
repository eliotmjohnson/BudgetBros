export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
}

export interface UserLoginResponse {
    id: string;
    email: string;
    token: string;
}

export type SessionRefreshResponse = UserLoginResponse;
