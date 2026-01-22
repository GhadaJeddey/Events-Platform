import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-button',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './button.html',
    styleUrl: './button.css'
})
export class ButtonComponent {
    label = input<string>('');
    type = input<'button' | 'submit' | 'reset'>('button');
    variant = input<'primary' | 'secondary' | 'outline' | 'danger'>('primary');
    isLoading = input<boolean>(false);
    isDisabled = input<boolean>(false);
    className = input<string>('');

    btnClick = output<void>();

    onClick(): void {
        if (!this.isLoading() && !this.isDisabled()) {
            this.btnClick.emit();
        }
    }
}
