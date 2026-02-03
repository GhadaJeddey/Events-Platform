import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate',
  standalone: true
})
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit: number = 150, completeWords: boolean = true, ellipsis: string = '...'): string {
    if (!value) return '';
    if (value.length <= limit) return value;

    if (completeWords) {
      // Truncate at the last complete word before the limit
      const truncated = value.substring(0, limit);
      const lastSpace = truncated.lastIndexOf(' ');
      return lastSpace > 0 
        ? truncated.substring(0, lastSpace) + ellipsis
        : truncated + ellipsis;
    }

    return value.substring(0, limit) + ellipsis;
  }
}
