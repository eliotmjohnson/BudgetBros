import { Component, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'FeatureModal',
    templateUrl: './feature-modal.component.html',
    styleUrl: './feature-modal.component.scss',
    standalone: false
})
export class FeatureModalComponent {
    @Output() sendClose = new EventEmitter();

    closeModal() {
        this.sendClose.emit();
    }
}
