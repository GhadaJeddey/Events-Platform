import { Directive, HostBinding, input } from '@angular/core';

@Directive({
    selector: '[appStatusBadge]',
    standalone: true
})
export class StatusBadgeDirective {
    status = input<string | undefined>('', { alias: 'appStatusBadge' });

    @HostBinding('style.background') get bg() {
        const s = this.status()?.toLowerCase();
        if (s === 'upcoming') return 'rgba(209, 250, 229, 0.7)';
        if (s === 'ongoing') return 'rgba(224, 231, 255, 0.7)';
        return 'rgba(249, 250, 251, 0.8)';
    }

    @HostBinding('style.color') get color() {
        const s = this.status()?.toLowerCase();
        if (s === 'upcoming') return '#059669';
        if (s === 'ongoing') return '#4f46e5';
        return '#4b5563';
    }


    @HostBinding('style.display') display = 'inline-flex';
    @HostBinding('style.alignItems') align = 'center';
    @HostBinding('style.padding') padding = '5px 12px';
    @HostBinding('style.borderRadius') radius = '12px';
    @HostBinding('style.fontSize') size = '11px';
    @HostBinding('style.fontWeight') weight = '700';
    @HostBinding('style.textTransform') transform = 'uppercase';
    @HostBinding('style.backdropFilter') blur = 'blur(8px)';
    @HostBinding('style.border') border = '1px solid rgba(255, 255, 255, 0.3)';
    @HostBinding('style.letterSpacing') spacing = '0.5px';
    @HostBinding('style.boxShadow') shadow = '0 4px 10px rgba(0, 0, 0, 0.05)';
}
