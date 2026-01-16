import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'inputDate',
})
export class InputDatePipe implements PipeTransform {

  transform(value: any): string {
    if (!value) return '';
    try {
      const date = new Date(value);
      // Correction du décalage horaire pour obtenir l'heure locale correcte en format ISO
      const offset = date.getTimezoneOffset() * 60000;
      const localISOTime = new Date(date.getTime() - offset).toISOString().substring(0, 16);
      return localISOTime;
    } catch (e) {
      return '';
    }
  }

}
