import { Component, input } from '@angular/core';

@Component({
    selector: 'Drawer',
    standalone: false,
    templateUrl: './drawer.component.html',
    styleUrl: './drawer.component.scss'
})
export class DrawerComponent {
    isOpen = input<boolean>(false);
    position = input<'left' | 'right'>('right');
}
