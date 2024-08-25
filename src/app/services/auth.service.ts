import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { BASE_BE_URL } from '../constants/constants';
import {
    SessionRefreshResponse,
    User,
    UserLoginResponse
} from '../models/user';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    isLoggedIn = false;
    isSubmitting = false;
    isLoading = signal<boolean>(false);

    loggedInUserName = 'User Name';
    userId: string | null = null;
    email: string | null = null;

    constructor(
        private http: HttpClient,
        private router: Router
    ) {}

    refreshSession(token: string) {
        this.isLoading.set(true);
        const email = localStorage.getItem('userEmail');
        const userId = localStorage.getItem('userId');

        return this.http
            .post<SessionRefreshResponse>(`${BASE_BE_URL}/session-refresh`, {
                token,
                email
            })
            .pipe(
                map((res) => {
                    this.isLoading.set(false);
                    this.isLoggedIn = true;
                    this.loggedInUserName = res.email;

                    if (!email && !userId)
                        this.setLocalStorageData(res.email, res.id);

                    this.userId = res.id;
                    this.email = res.email;

                    return true;
                }),
                catchError(() => {
                    this.isLoading.set(false);
                    this.logout(true);

                    return of(false);
                })
            );
    }

    login(username: string, password: string) {
        this.isSubmitting = true;
        const auth = btoa(`${username}:${password}`).toString();
        const headers = new HttpHeaders({
            Authorization: `Basic ${auth}`
        });

        return this.http.get<UserLoginResponse>(`${BASE_BE_URL}/login`, {
            headers
        });
    }

    register(newUser: User) {
        this.isSubmitting = true;
        return this.http.post<User>(`${BASE_BE_URL}/register`, newUser);
    }

    logout(isTokenRefresh = false) {
        this.isLoggedIn = false;
        this.userId = null;
        this.email = null;
        this.loggedInUserName = '';
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userId');
        if (!isTokenRefresh) this.router.navigateByUrl('/login');
    }

    setLocalStorageData(email: string, id: string, token?: string) {
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userId', String(id));
        if (token) localStorage.setItem('token', token);
    }
}
