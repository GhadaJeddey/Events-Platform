import { Directive, HostBinding, HostListener, Input } from '@angular/core';

@Directive({
    selector: '[appHoverElevate]',
    standalone: true
})
export class HoverElevateDirective {

    @Input() elevateAmount = '-10px';
    @Input() shadowColor = 'rgba(102, 126, 234, 0.2)';
    @Input() shadowStrength = '20px 40px';

    @HostBinding('style.transition') transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
    @HostBinding('style.transform') transform = 'translateY(0)';
    @HostBinding('style.boxShadow') shadow = 'none';

    @HostListener('mouseenter') onMouseEnter() {
        this.transform = `translateY(${this.elevateAmount})`;
        this.shadow = `0 ${this.shadowStrength} ${this.shadowColor}`;
    }

    @HostListener('mouseleave') onMouseLeave() {
        this.transform = 'translateY(0)';
        this.shadow = 'none';
    }
}
