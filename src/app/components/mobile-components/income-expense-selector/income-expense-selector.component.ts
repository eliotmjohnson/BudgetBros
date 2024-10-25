import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'IncomeExpenseSelector',
    templateUrl: './income-expense-selector.component.html',
    styleUrl: './income-expense-selector.component.scss'
})
export class IncomeExpenseSelectorComponent implements OnInit {
    @Input() isIncomeSelected = false;
    @Output() setIncomeSelectedValue = new EventEmitter<boolean>();
    isSelectorVisible = false;

    setSelector(isIncomeSelected: boolean) {
        this.isIncomeSelected = isIncomeSelected;
        this.setIncomeSelectedValue.emit(isIncomeSelected);
    }

    ngOnInit(): void {
        this.isSelectorVisible = true;
    }
}
