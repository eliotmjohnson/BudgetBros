import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, delay, map, of, tap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    isLoggedIn = false;
    isSubmitting = false;
    isLoading = false;

    constructor(private http: HttpClient, private router: Router) {}

    validateAuthToken(token: string) {
        this.isLoading = true;
        return this.http.get<any>('https://swapi.dev/api/people/1').pipe(
            map((data) => {
                if (data.name === 'Luke Skywalker') {
                    this.isLoading = false;
                    this.isLoggedIn = true;
                    return true;
                } else {
                    this.isLoading = false;
                    this.isLoggedIn = false;
                    return false;
                }
            })
        );
    }

    login() {
        this.isSubmitting = true;
        return of('TestToken').pipe(delay(1000));
    }

    register() {
        this.isSubmitting = true;
        return of('TestToken').pipe(delay(1000));
    }

    logout() {
        this.isLoggedIn = false;
        localStorage.removeItem('token');
        this.router.navigateByUrl('/login');
    }
}
