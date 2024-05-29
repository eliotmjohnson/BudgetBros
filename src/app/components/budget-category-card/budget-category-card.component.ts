import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import {
    AfterViewChecked,
    Component,
    ElementRef,
    Input,
    ViewChild
} from '@angular/core';
import { BudgetItem } from 'src/app/models/budget';

@Component({
    selector: 'BudgetCategoryCard',
    templateUrl: './budget-category-card.component.html',
    styleUrls: ['./budget-category-card.component.scss']
})
export class BudgetCategoryCardComponent implements AfterViewChecked {
    @ViewChild('titleInput') titleInput!: ElementRef<HTMLInputElement>;
    @Input() budgetCategoryItems: BudgetItem[] = [];
    @Input() name = '';
    isEditingName = false;

    ngAfterViewChecked(): void {
        if (this.titleInput && this.isEditingName) {
            this.titleInput.nativeElement.focus();
            this.titleInput.nativeElement.select();
        }
    }

    changeTitle(e: SubmitEvent) {
        e.preventDefault();
        this.name = this.titleInput.nativeElement.value;
        this.isEditingName = false;
    }

    handleDrop(event: CdkDragDrop<BudgetItem[]>) {
        moveItemInArray(
            this.budgetCategoryItems,
            event.previousIndex,
            event.currentIndex
        );
    }
}
