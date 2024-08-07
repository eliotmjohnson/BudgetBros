import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { BE_API_URL } from '../constants/constants';
import { toSignal } from '@angular/core/rxjs-interop';
import { Budget } from '../models/budget';
import { AuthService } from './auth.service';

const baseUrl = `${BE_API_URL}/budgets`

@Injectable({
    providedIn: 'root'
})
export class BudgetService {
    http = inject(HttpClient);
    authService = inject(AuthService);

    getBudget(monthNumber: number, year: number) {
        if (this.authService.userId) {
            return toSignal(
                this.http.get<Budget>(
                    `${baseUrl}/${this.authService.userId}?month_number=${monthNumber}&year=${year}`
                )
            );
        }

        return signal(undefined);
    }
}
