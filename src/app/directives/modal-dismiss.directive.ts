import { Directive, ElementRef, output, Renderer2 } from '@angular/core';
import { MobileModalService } from '../services/mobile-modal.service';

@Directive({
    selector: '[appModalDismiss]',
    standalone: false,
    host: {
        '(touchstart)': 'this.startDismissalDrag($event)',
        '[style.transform]': 'this.translateY',
        '[style.transition]': 'this.modalTransition'
    }
})
export class ModalDismissDirective {
    onModalDismiss = output();

    translateY = '';
    modalTransition: string | undefined = undefined;

    constructor(
        private renderer: Renderer2,
        private mobileModalService: MobileModalService,
        private host: ElementRef
    ) {}

    startDismissalDrag(e: TouchEvent) {
        const initialYPos = e.touches[0].clientY;
        const initialTime = e.timeStamp;
        this.modalTransition = 'transform 0.08s';

        const touchMoveListener = this.renderer.listen(
            this.host.nativeElement,
            'touchmove',
            (e: TouchEvent) => {
                const inputs = document.querySelectorAll('input, textarea');
                inputs.forEach((input) =>
                    (input as HTMLInputElement | HTMLTextAreaElement).blur()
                );
                const currentYPos = e.touches[0].clientY;
                const diff = currentYPos - initialYPos;
                this.mobileModalService.modalDismissalProgress.set(
                    diff < 0 ? diff / 6000 : diff / 650
                );
                this.translateY = `translateY(${diff < 0 ? diff * 0.03 : diff}px)`;
            }
        );
        const touchEndListener = this.renderer.listen(
            this.host.nativeElement,
            'touchend',
            (e: TouchEvent) => {
                this.modalTransition = undefined;
                const endYPos = e.changedTouches[0].clientY;
                const endTime = e.timeStamp;
                const velocity =
                    (endYPos - initialYPos) / (endTime - initialTime);

                if (endYPos - initialYPos < 400 && velocity < 0.75) {
                    setTimeout(() => (this.translateY = ''), 40); // iOS is crippled :(
                } else {
                    this.onModalDismiss.emit();
                }

                this.mobileModalService.modalDismissalProgress.set(undefined);
                touchMoveListener();
                touchEndListener();
            }
        );
    }
}
