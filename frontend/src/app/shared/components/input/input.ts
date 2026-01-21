import { Component, input, output, forwardRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
    selector: 'app-input',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule],
    templateUrl: './input.html',
    styleUrl: './input.css',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => InputComponent),
            multi: true
        }
    ]
})
export class InputComponent implements ControlValueAccessor {
    label = input<string>('');
    type = input<string>('text');
    placeholder = input<string>('');
    id = input<string>(`input-${Math.random().toString(36).substr(2, 9)}`);
    error = input<string | null>(null);
    isTouched = signal(false);
    isDisabled = signal(false);
    value = signal<any>('');

    onChange: any = () => { };
    onTouched: any = () => { };

    handleInput(event: Event): void {
        const value = (event.target as HTMLInputElement).value;
        this.value.set(value);
        this.onChange(value);
    }

    handleBlur(): void {
        this.isTouched.set(true);
        this.onTouched();
    }

    // ControlValueAccessor methods
    writeValue(value: any): void {
        this.value.set(value);
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.isDisabled.set(isDisabled);
    }
}
