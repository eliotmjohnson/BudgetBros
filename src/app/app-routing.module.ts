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
            { path: 'budget', component: BudgetComponent },
            { path: 'transactions', component: TransactionsComponent },
            { path: 'goals', component: GoalsComponent },
            { path: 'accounts', component: AccountsComponent },
            { path: 'settings', component: SettingsComponent }
        ]
    },
    { path: 'login', component: LoginComponent, canActivate: [loginGuard] }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {}
