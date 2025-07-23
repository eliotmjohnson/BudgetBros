import {
    Component,
    effect,
    ElementRef,
    input,
    OnDestroy,
    output,
    Renderer2
} from '@angular/core';
import { BudgetCategoryCardComponent } from '../../budget-category-card/budget-category-card.component';
import { BudgetCategoryService } from 'src/app/services/budget-category.service';

@Component({
    selector: 'CategoryCardDeleteButton',
    standalone: false,
    templateUrl: './category-card-delete-button.component.html',
    styleUrl: './category-card-delete-button.component.scss'
})
export class CategoryCardDeleteButtonComponent implements OnDestroy {
    categoryContainer = input<HTMLDivElement>();
    onBudgetCategoryDelete = output();
    scrollProgress = 0;
    scrollListener?: () => void;
    onDelete = output();

    constructor(
        private el: ElementRef<HTMLElement>,
        private budgetCategoryService: BudgetCategoryService,
        private renderer: Renderer2
    ) {
        effect(() => {
            if (this.categoryContainer()) {
                this.scrollListener = this.renderer.listen(
                    this.categoryContainer(),
                    'scroll',
                    () => {
                        this.scrollProgress =
                            this.categoryContainer()!.scrollLeft /
                            this.el.nativeElement.clientWidth;
                    }
                );
            }
        });
    }

    deleteBudgetCategory(e: MouseEvent) {
        e.stopPropagation();
        this.categoryContainer()!.scrollTo({ left: 0, behavior: 'smooth' });
        setTimeout(() => {
            this.onBudgetCategoryDelete.emit();
        }, 200);
    }

    ngOnDestroy(): void {
        this.scrollListener!();
    }
}
