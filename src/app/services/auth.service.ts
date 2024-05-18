import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { BASE_BE_URL } from '../constants/constants';
import { User, UserLoginResponse } from '../models/user';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    isLoggedIn = false;
    isSubmitting = false;
    isLoading = false;
    loggedInUserName = 'User Name';

    constructor(private http: HttpClient, private router: Router) {}

    validateAuthToken(token: string) {
        this.isLoading = true;
        return this.http
            .post<'success'>(`${BASE_BE_URL}/validate-token`, { token })
            .pipe(
                map(() => {
                    this.isLoading = false;
                    this.isLoggedIn = true;
                    return true;
                }),
                catchError(() => {
                    this.isLoading = false;
                    this.isLoggedIn = false;
                    localStorage.removeItem('token');
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
        this.router.navigateByUrl('/login');
    }
}
