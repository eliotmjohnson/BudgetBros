import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import {
    AfterViewChecked,
    Component,
    ElementRef,
    Input,
    ViewChild
} from '@angular/core';
import { LineItem } from 'src/app/models/budget';
import { TransactionService } from 'src/app/services/transaction.service';

@Component({
    selector: 'BudgetCategoryCard',
    templateUrl: './budget-category-card.component.html',
    styleUrls: ['./budget-category-card.component.scss']
})
export class BudgetCategoryCardComponent implements AfterViewChecked {
    @ViewChild('titleInput') titleInput!: ElementRef<HTMLInputElement>;
    @Input() lineItems: LineItem[] = [];
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

    handleDrop(event: CdkDragDrop<LineItem[]>) {
        moveItemInArray(
            this.lineItems,
            event.previousIndex,
            event.currentIndex
        );
    }
}
