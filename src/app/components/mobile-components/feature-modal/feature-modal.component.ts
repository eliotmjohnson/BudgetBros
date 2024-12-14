import { Component, EventEmitter, Output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'FeatureModal',
    templateUrl: './feature-modal.component.html',
    styleUrl: './feature-modal.component.scss',
    imports: [MatIcon]
})
export class FeatureModalComponent {
    @Output() sendClose = new EventEmitter();

    closeModal() {
        this.sendClose.emit();
    }
}
