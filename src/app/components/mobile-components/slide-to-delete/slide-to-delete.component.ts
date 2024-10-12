import {
    Component,
    effect,
    input,
    ElementRef,
    Input,
    Renderer2,
    untracked,
    Output,
    EventEmitter,
    OnInit
} from '@angular/core';
import { MobileModalService } from 'src/app/services/mobile-modal.service';

@Component({
    selector: 'slide-to-delete',
    templateUrl: './slide-to-delete.component.html',
    styleUrl: './slide-to-delete.component.scss',
    host: {
        '(scroll)': 'setSlideToDelete()',
        '(touchstart)': 'createTouchEndListener()',
        '[class.overflow-visible]': 'disabled'
    }
})
export class SlideToDeleteComponent implements OnInit {
    @Input() disabled = false;
    @Input() deleteButtonPosition = 0;
    @Input({ transform: (value: number) => value * 0.01 }) deleteDistance = 0.7;
    @Output() deleteItem = new EventEmitter();
    closed = input(false);
    isDeleteMoved = false;
    isDeletingLineItem = false;
    deleteButtonSize = 0;
    initialDeletePosition = 0;
    touchlistener: (() => void) | null = null;

    constructor(
        public mobileModalService: MobileModalService,
        private renderer: Renderer2,
        private host: ElementRef<HTMLElement>
    ) {
        effect(() => {
            if (
                this.closed() &&
                untracked(() => mobileModalService.isMobileDevice())
            ) {
                this.host.nativeElement.scrollTo({
                    left: 0,
                    behavior: 'smooth'
                });
            }
        });
    }

    ngOnInit(): void {
        this.deleteButtonSize = (100 - this.deleteButtonPosition) / 100;
        this.initialDeletePosition = this.deleteButtonPosition;
    }

    setSlideToDelete(isSlideEnd = false) {
        const elementWidth = this.host.nativeElement.clientWidth;
        const scrollPosition = this.host.nativeElement.scrollLeft;
        const elementButtonSize = elementWidth * this.deleteButtonSize;
        const elementDeleteDistance = elementWidth * this.deleteDistance;

        if (isSlideEnd) {
            this.isDeletingLineItem = false;
            this.touchlistener!();
            this.touchlistener = null;

            if (scrollPosition === 0) {
                // iOS is crippled and this has to be done to prevent scrolling accidentally...
                setTimeout(() => {
                    if (this.host.nativeElement.scrollLeft !== 0) {
                        this.host.nativeElement.scrollTo({
                            left: 0,
                            behavior: 'smooth'
                        });
                    }
                }, 50);
            } else if (
                scrollPosition < elementButtonSize &&
                scrollPosition > 0
            ) {
                this.host.nativeElement.scrollTo({
                    left: 0,
                    behavior: 'smooth'
                });
            } else if (
                scrollPosition >= elementButtonSize &&
                scrollPosition < elementDeleteDistance
            ) {
                this.host.nativeElement.scrollTo({
                    left: elementWidth * (this.deleteButtonSize * 2),
                    behavior: 'smooth'
                });
            } else if (scrollPosition >= elementDeleteDistance) {
                this.host.nativeElement.scrollTo({
                    left: elementWidth,
                    behavior: 'smooth'
                });

                this.isDeletingLineItem = true;
                setTimeout(() => this.deleteItem.emit(), 100);
            }
        } else {
            if (scrollPosition > elementWidth * this.deleteDistance) {
                this.isDeleteMoved = true;
                this.deleteButtonPosition = 0;
            } else {
                this.deleteButtonPosition = this.initialDeletePosition;
                this.isDeleteMoved = false;
            }
        }
    }

    createTouchEndListener() {
        if (!this.touchlistener) {
            this.touchlistener = this.renderer.listen(
                'document',
                'touchend',
                () => this.setSlideToDelete(true)
            );
        }
    }
}
