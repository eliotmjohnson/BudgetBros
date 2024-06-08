import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { BASE_BE_URL } from '../constants/constants';
import { SessionRefreshResponse, User, UserLoginResponse } from '../models/user';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    isLoggedIn = false;
    isSubmitting = false;
    isLoading = signal<boolean>(false);
    loggedInUserName = 'User Name';

    constructor(private http: HttpClient, private router: Router) {}

    refreshSession(token: string) {
        this.isLoading.set(true);
        const email = localStorage.getItem('userEmail');

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

                    if (!email) localStorage.setItem('userEmail', res.email)

                    return true;
                }),
                catchError(() => {
                    this.isLoading.set(false);
                    this.isLoggedIn = false;

                    localStorage.removeItem('token');
                    localStorage.removeItem('userEmail');
                    
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

    logout() {
        this.isLoggedIn = false;
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        this.router.navigateByUrl('/login');
    }
}
