import { NgModule } from '@angular/core';

import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DragDropModule } from '@angular/cdk/drag-drop';
import {
    MatDateRangeInput,
    MatDateRangePicker,
    MatDatepickerModule,
    MatDatepickerToggle
} from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule } from '@angular/material/dialog';
import {MatTooltipModule } from '@angular/material/tooltip';

import { AppComponent } from './app.component';
import { HomeHeaderComponent } from './components/home-header/home-header.component';
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
import { BudgetCategoryCardComponent } from './components/budget-category-card/budget-category-card.component';
import { BudgetCategoryItemComponent } from './components/budget-category-item/budget-category-item.component';
import { TransactionCardComponent } from './components/transaction-card/transaction-card.component';
import { BudgetTransactionsCardComponent } from './components/budget-transactions-card/budget-transactions-card.component';
import { httpInterceptor } from './interceptors/http.interceptor';
import { TransactionsDatePickerComponent } from './components/transactions-date-picker/transactions-date-picker.component';
import { InlineTransactionComponent } from './components/inline-transaction/inline-transaction.component';
import { AddTransactionModalComponent } from './components/add-transaction-modal/add-transaction-modal.component';

@NgModule({
    declarations: [
        AppComponent,
        HomeHeaderComponent,
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
        CardComponent,
        BudgetCategoryCardComponent,
        BudgetCategoryItemComponent,
        TransactionCardComponent,
        BudgetTransactionsCardComponent,
        TransactionsDatePickerComponent,
        InlineTransactionComponent,
        AddTransactionModalComponent
    ],
    bootstrap: [AppComponent],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        MatIconModule,
        MatButtonModule,
        MatCardModule,
        MatChipsModule,
        MatMenuModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        MatProgressSpinnerModule,
        DragDropModule,
        MatDateRangeInput,
        MatDateRangePicker,
        MatDatepickerToggle,
        MatDatepickerModule,
        MatDividerModule,
        MatDialogModule,
        MatTooltipModule
    ],
    providers: [provideHttpClient(withInterceptors([httpInterceptor]))]
})
export class AppModule {}
