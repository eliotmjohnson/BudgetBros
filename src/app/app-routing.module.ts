import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { authGuard } from './guards/auth.guard';
import { loginGuard } from './guards/login.guard';
import { BudgetComponent } from './pages/home/budget/budget.component';
import { TransactionsComponent } from './pages/home/transactions/transactions.component';
import { GoalsComponent } from './pages/home/goals/goals.component';
import { AccountsComponent } from './pages/home/accounts/accounts.component';
import { SettingsComponent } from './pages/home/settings/settings.component';

const routes: Routes = [
    { path: '', redirectTo: 'home/budget', pathMatch: 'full' },
    { path: 'home', redirectTo: 'home/budget', pathMatch: 'full' },
    {
        path: 'home',
        component: HomeComponent,
        canActivate: [authGuard],
        children: [
            {
                path: 'budget',
                component: BudgetComponent,
                data: { routeName: 'budget' }
            },
            {
                path: 'transactions',
                component: TransactionsComponent,
                data: { routeName: 'transactions' }
            },
            {
                path: 'goals',
                component: GoalsComponent,
                data: { routeName: 'goals' }
            },
            {
                path: 'accounts',
                component: AccountsComponent,
                data: { routeName: 'accounts' }
            },
            {
                path: 'settings',
                component: SettingsComponent,
                data: { routeName: 'settings' }
            }
        ]
    },
    { path: 'login', component: LoginComponent, canActivate: [loginGuard] },
    { path: '**', redirectTo: 'home/budget' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {}
