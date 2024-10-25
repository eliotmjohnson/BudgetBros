import { NgModule } from '@angular/core';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideNativeDateAdapter } from '@angular/material/core';

import { DragDropModule } from '@angular/cdk/drag-drop';
import { LayoutModule } from '@angular/cdk/layout';
import { OverlayModule } from '@angular/cdk/overlay';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import {
    MatDateRangeInput,
    MatDateRangePicker,
    MatDatepickerModule,
    MatDatepickerToggle
} from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { AuthFormComponent } from './components/auth-form/auth-form.component';
import { BBLogoComponent } from './components/bb-logo/bb-logo.component';
import { BBSnagComponent } from './components/bb-snag/bb-snag.component';
import { BudgetCalculatorComponent } from './components/budget-calculator/budget-calculator.component';
import { BudgetCategoryCardComponent } from './components/budget-category-card/budget-category-card.component';
import { BudgetCategoryItemComponent } from './components/budget-category-item/budget-category-item.component';
import { BudgetTransactionsCardComponent } from './components/budget-transactions-card/budget-transactions-card.component';
import { CardComponent } from './components/card/card.component';
import { FieldErrorComponent } from './components/field-error/field-error.component';
import { HomeHeaderComponent } from './components/home-header/home-header.component';
import { IncomeDrawerComponent } from './components/income-drawer/income-drawer.component';
import { InlineTransactionComponent } from './components/inline-transaction/inline-transaction.component';
import { LinkButtonComponent } from './components/link-button/link-button.component';
import { AddTransactionMobileModalComponent } from './components/mobile-components/add-transaction-mobile-modal/add-transaction-mobile-modal.component';
import { AmountTypeSelectorComponent } from './components/mobile-components/amount-type-selector/amount-type-selector.component';
import { IncomeExpenseSelectorComponent } from './components/mobile-components/income-expense-selector/income-expense-selector.component';
import { SlideToDeleteComponent } from './components/mobile-components/slide-to-delete/slide-to-delete.component';
import { TabsBarComponent } from './components/mobile-components/tabs-bar/tabs-bar.component';
import { MobileConstructionComponent } from './components/mobile-construction/mobile-construction.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { TransactionCardComponent } from './components/transaction-card/transaction-card.component';
import { TransactionModalComponent } from './components/transaction-modal/transaction-modal.component';
import { TransactionsDatePickerComponent } from './components/transactions-date-picker/transactions-date-picker.component';
import { httpInterceptor } from './interceptors/http.interceptor';
import { AccountsComponent } from './pages/home/accounts/accounts.component';
import { BudgetComponent } from './pages/home/budget/budget.component';
import { GoalsComponent } from './pages/home/goals/goals.component';
import { HomeComponent } from './pages/home/home.component';
import { SettingsComponent } from './pages/home/settings/settings.component';
import { TransactionsComponent } from './pages/home/transactions/transactions.component';
import { LoginComponent } from './pages/login/login.component';
import { SortByDatePipe } from './pipes/sort-by-date.pipe';

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
        TransactionModalComponent,
        FieldErrorComponent,
        BBSnagComponent,
        MobileConstructionComponent,
        TabsBarComponent,
        AddTransactionMobileModalComponent,
        AmountTypeSelectorComponent,
        SortByDatePipe,
        SlideToDeleteComponent,
        IncomeDrawerComponent,
        BudgetCalculatorComponent,
        IncomeExpenseSelectorComponent
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
        MatTooltipModule,
        MatSelectModule,
        OverlayModule,
        LayoutModule,
        MatRadioModule
    ],
    providers: [
        provideHttpClient(withInterceptors([httpInterceptor])),
        provideNativeDateAdapter()
    ]
})
export class AppModule {}
