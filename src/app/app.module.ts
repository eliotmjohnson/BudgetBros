import { NgModule } from '@angular/core';

import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { LinkButtonComponent } from './components/link-button/link-button.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthFormComponent } from './components/auth-form/auth-form.component';
import { BBLogoComponent } from './components/bb-logo/bb-logo.component';
import { BudgetComponent } from './pages/home/budget/budget.component';
import { TransactionsComponent } from './pages/home/transactions/transactions.component';
import { GoalsComponent } from './pages/home/goals/goals.component';
import { AccountsComponent } from './pages/home/accounts/accounts.component';
import { SettingsComponent } from './pages/home/settings/settings.component';
import { CardComponent } from './components/card/card.component';

@NgModule({
    declarations: [
        AppComponent,
        HeaderComponent,
        SidebarComponent,
        LinkButtonComponent,
        HomeComponent,
        LoginComponent,
        AuthFormComponent,
        BBLogoComponent,
        BudgetComponent,
        TransactionsComponent,
        GoalsComponent,
        AccountsComponent,
        SettingsComponent,
        CardComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        HttpClientModule,
        MatIconModule,
        MatButtonModule,
        MatCardModule,
        MatMenuModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        MatProgressSpinnerModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {}
